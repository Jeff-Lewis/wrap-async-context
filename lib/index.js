import asyncHook from '@musicglue/async-hook';

const contexts = new Map();
let currentUid = null;

export const hasContext = (uid = currentUid) => contexts.has(uid);

// When a new async handle is created
function init(uid, handle, provider, parentId) {
  if (contexts.has(parentId || currentUid)) {
    // This new async handle is the child of a handle with a context.
    // Set this handles context to that of its parent.
    contexts.set(uid, contexts.get(parentId || currentUid));
  }
}

// Before a handle starts
function pre(uid) {
  currentUid = uid;
}

// After a handle ends
function post() {
  currentUid = null;
}

// When a handle is destroyed
function destroy(uid) {
  if (hasContext(uid)) {
    contexts.delete(uid);
  }
}

asyncHook.addHooks({ init, pre, post, destroy });
asyncHook.enable();

export const createContext = (id, data) => {
  if (!currentUid) throw new Error('createContext must be called in an async handle!');
  const context = { id, ...data };
  contexts.set(currentUid, context);
  return context;
};

export const createContextMiddleware = (idGen) => (req, res, next) => {
  process.nextTick(() => {
    createContext(req.headers['x-request-id'] || idGen(), { req });
    next();
  });
};

export default () => contexts.get(currentUid);
