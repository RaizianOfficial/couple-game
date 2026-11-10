// Lightweight in-memory RTDB Relay for local multi-device & multi-context testing

export function setupRelay(middlewares) {
  const clients = new Set();
  let dbData = {};
  const disconnectMap = new Map(); // clientId -> { path: val }

  function getNested(obj, pathArr) {
    let curr = obj;
    for (const seg of pathArr) {
      if (curr === undefined || curr === null) return undefined;
      curr = curr[seg];
    }
    return curr;
  }

  function setNested(obj, pathArr, val) {
    if (pathArr.length === 0) return val;
    let curr = obj;
    for (let i = 0; i < pathArr.length - 1; i++) {
      const seg = pathArr[i];
      if (!curr[seg] || typeof curr[seg] !== 'object') {
        curr[seg] = {};
      }
      curr = curr[seg];
    }
    const lastSeg = pathArr[pathArr.length - 1];
    if (val === null || val === undefined) {
      delete curr[lastSeg];
    } else {
      curr[lastSeg] = JSON.parse(JSON.stringify(val));
    }
    return obj;
  }

  function broadcast(data) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
      try {
        res.write(payload);
      } catch (e) {
        clients.delete(res);
      }
    }
  }

  middlewares.use((req, res, next) => {
    const url = new URL(req.url, 'http://localhost');

    // 1. SSE Stream for Realtime Updates
    if (url.pathname === '/api/rtdb/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      const clientId = url.searchParams.get('clientId') || Math.random().toString(36).substring(2);
      res.clientId = clientId;
      clients.add(res);

      // Send initial data dump
      res.write(`data: ${JSON.stringify({ type: 'INIT', data: dbData })}\n\n`);

      req.on('close', () => {
        clients.delete(res);
        // Execute onDisconnect handlers for this client
        const handlers = disconnectMap.get(clientId);
        if (handlers) {
          for (const [dPath, dVal] of Object.entries(handlers)) {
            const pathArr = dPath ? dPath.split('/').filter(Boolean) : [];
            setNested(dbData, pathArr, dVal);
            broadcast({ type: 'SYNC', path: dPath, val: dVal });
          }
          disconnectMap.delete(clientId);
        }
      });
      return;
    }

    // 2. Action Endpoint (Set, Update, OnDisconnect registration)
    if (url.pathname === '/api/rtdb/action' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const action = JSON.parse(body);
          const { type, path, val, clientId, handlers } = action;

          if (type === 'SYNC') {
            const pathArr = path ? path.split('/').filter(Boolean) : [];
            setNested(dbData, pathArr, val);
            broadcast({ type: 'SYNC', path, val });
          } else if (type === 'REGISTER_DISCONNECT') {
            if (!disconnectMap.has(clientId)) {
              disconnectMap.set(clientId, {});
            }
            Object.assign(disconnectMap.get(clientId), handlers);
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // 3. Get Data Snapshot
    if (url.pathname === '/api/rtdb/get') {
      const qPath = url.searchParams.get('path') || '';
      const pathArr = qPath ? qPath.split('/').filter(Boolean) : [];
      const val = getNested(dbData, pathArr);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ val: val === undefined ? null : val }));
      return;
    }

    next();
  });
}
