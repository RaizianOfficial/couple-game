// Local Realtime Database Simulator connecting via SSE & BroadcastChannel
// Allows seamless real-time syncing across separate tabs, incognito windows, and mobile devices on LAN

class MockDatabase {
  constructor() {
    this.clientId = 'client_' + Math.random().toString(36).substring(2, 9);
    this.listeners = new Map(); // path -> Set of callbacks
    this.data = {};
    this.disconnectHandlers = {}; // path -> value to set on disconnect
    this.eventSource = null;

    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('our_little_town_rtdb') : null;

    if (this.channel) {
      this.channel.onmessage = (event) => {
        const { type, path, val } = event.data;
        if (type === 'SYNC') {
          this._setInternal(path, val, false, false);
        }
      };
    }

    // Connect to server SSE relay if available
    this._connectRelay();
  }

  _connectRelay() {
    if (typeof EventSource === 'undefined') return;
    try {
      this.eventSource = new EventSource(`/api/rtdb/events?clientId=${this.clientId}`);
      this.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'INIT') {
            this.data = payload.data || {};
            this._notifyAll();
          } else if (payload.type === 'SYNC') {
            this._setInternal(payload.path, payload.val, false, false);
          }
        } catch (e) {}
      };
    } catch (e) {}
  }

  _getNested(obj, pathArr) {
    let curr = obj;
    for (const seg of pathArr) {
      if (curr === undefined || curr === null) return undefined;
      curr = curr[seg];
    }
    return curr;
  }

  _setNested(obj, pathArr, val) {
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

  _notifyAll() {
    for (const path of this.listeners.keys()) {
      this._notifyListeners(path);
    }
  }

  _notifyListeners(path) {
    const normPath = this._norm(path);
    const pathArr = normPath ? normPath.split('/') : [];
    const val = this._getNested(this.data, pathArr);

    for (const [subPath, callbacks] of this.listeners.entries()) {
      if (subPath === normPath || subPath.startsWith(normPath + '/') || normPath.startsWith(subPath + '/') || subPath === '') {
        const subPathArr = subPath ? subPath.split('/') : [];
        const subVal = this._getNested(this.data, subPathArr);
        const snapshot = {
          exists: () => subVal !== undefined && subVal !== null,
          val: () => (subVal === undefined ? null : JSON.parse(JSON.stringify(subVal))),
          key: subPathArr.length ? subPathArr[subPathArr.length - 1] : null,
          child: (relPath) => {
            const relArr = relPath.split('/').filter(Boolean);
            const combined = [...subPathArr, ...relArr];
            const childVal = this._getNested(this.data, combined);
            return {
              exists: () => childVal !== undefined && childVal !== null,
              val: () => (childVal === undefined ? null : JSON.parse(JSON.stringify(childVal)))
            };
          }
        };
        callbacks.forEach(cb => {
          try { cb(snapshot); } catch (e) { console.error('Listener err', e); }
        });
      }
    }
  }

  _setInternal(path, val, broadcastLocal = true, sendServer = true) {
    const norm = this._norm(path);
    const pathArr = norm ? norm.split('/') : [];
    this._setNested(this.data, pathArr, val);

    this._notifyListeners(norm);

    if (broadcastLocal && this.channel) {
      this.channel.postMessage({ type: 'SYNC', path: norm, val });
    }

    if (sendServer) {
      fetch('/api/rtdb/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SYNC', path: norm, val, clientId: this.clientId })
      }).catch(() => {});
    }
  }

  _norm(p) {
    if (!p) return '';
    return p.replace(/^\/+|\/+$/g, '');
  }

  ref(path = '') {
    const norm = this._norm(path);
    return {
      _path: norm,
      key: norm ? norm.split('/').pop() : null
    };
  }

  async set(ref, val) {
    this._setInternal(ref._path, val, true, true);
  }

  async update(ref, updates) {
    for (const [subPath, subVal] of Object.entries(updates)) {
      const fullPath = ref._path ? `${ref._path}/${subPath}` : subPath;
      this._setInternal(fullPath, subVal, true, true);
    }
  }

  async get(ref) {
    const norm = this._norm(ref._path);
    const pathArr = norm ? norm.split('/') : [];
    let val = this._getNested(this.data, pathArr);

    // If undefined locally, try server get
    if (val === undefined) {
      try {
        const res = await fetch(`/api/rtdb/get?path=${encodeURIComponent(norm)}`);
        const json = await res.json();
        val = json.val;
        if (val !== undefined && val !== null) {
          this._setNested(this.data, pathArr, val);
        }
      } catch (e) {}
    }

    return {
      exists: () => val !== undefined && val !== null,
      val: () => (val === undefined ? null : JSON.parse(JSON.stringify(val))),
      key: ref.key
    };
  }

  onValue(ref, callback) {
    const norm = this._norm(ref._path);
    if (!this.listeners.has(norm)) {
      this.listeners.set(norm, new Set());
    }
    this.listeners.get(norm).add(callback);

    // Initial trigger
    const pathArr = norm ? norm.split('/') : [];
    const val = this._getNested(this.data, pathArr);
    const snapshot = {
      exists: () => val !== undefined && val !== null,
      val: () => (val === undefined ? null : JSON.parse(JSON.stringify(val))),
      key: ref.key
    };
    setTimeout(() => callback(snapshot), 0);

    return () => this.off(ref, callback);
  }

  off(ref, callback) {
    const norm = this._norm(ref._path);
    if (this.listeners.has(norm)) {
      if (callback) {
        this.listeners.get(norm).delete(callback);
      } else {
        this.listeners.delete(norm);
      }
    }
  }

  onDisconnect(ref) {
    return {
      set: async (val) => {
        this.disconnectHandlers[ref._path] = val;
        fetch('/api/rtdb/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'REGISTER_DISCONNECT',
            clientId: this.clientId,
            handlers: { [ref._path]: val }
          })
        }).catch(() => {});
      },
      update: async (updates) => {
        const reg = {};
        for (const [subKey, subVal] of Object.entries(updates)) {
          const fullPath = ref._path ? `${ref._path}/${subKey}` : subKey;
          this.disconnectHandlers[fullPath] = subVal;
          reg[fullPath] = subVal;
        }
        fetch('/api/rtdb/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'REGISTER_DISCONNECT',
            clientId: this.clientId,
            handlers: reg
          })
        }).catch(() => {});
      },
      remove: async () => {
        this.disconnectHandlers[ref._path] = null;
      },
      cancel: async () => {
        delete this.disconnectHandlers[ref._path];
      }
    };
  }

  async runTransaction(ref, updateFn) {
    const norm = this._norm(ref._path);
    const pathArr = norm ? norm.split('/') : [];
    const currVal = this._getNested(this.data, pathArr);
    const newVal = updateFn(currVal === undefined ? null : JSON.parse(JSON.stringify(currVal)));
    if (newVal !== undefined) {
      this._setInternal(norm, newVal, true, true);
    }
    return {
      committed: true,
      snapshot: {
        val: () => newVal
      }
    };
  }

  push(ref, val) {
    const id = 'k_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    const fullPath = ref._path ? `${ref._path}/${id}` : id;
    if (val !== undefined) {
      this._setInternal(fullPath, val, true, true);
    }
    return {
      _path: fullPath,
      key: id
    };
  }

  async remove(ref) {
    this._setInternal(ref._path, null, true, true);
  }
}

class MockAuth {
  constructor() {
    this.currentUser = null;
    this.authListeners = new Set();
    const storedUid = sessionStorage.getItem('__mock_uid__');
    if (storedUid) {
      this.currentUser = { uid: storedUid, isAnonymous: true };
    }
  }

  async signInAnonymously() {
    if (!this.currentUser) {
      let uid = sessionStorage.getItem('__mock_uid__');
      if (!uid) {
        uid = 'user_' + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem('__mock_uid__', uid);
      }
      this.currentUser = { uid, isAnonymous: true };
      this.authListeners.forEach(cb => cb(this.currentUser));
    }
    return { user: this.currentUser };
  }

  onAuthStateChanged(callback) {
    this.authListeners.add(callback);
    callback(this.currentUser);
    return () => this.authListeners.delete(callback);
  }
}

export const mockDb = new MockDatabase();
export const mockAuth = new MockAuth();
