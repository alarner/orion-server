module.exports = {
	// * cookie name (formerly known as key). (default: 'connect.sid')
	name: 'sess',
	// * session store instance.
	store: '',
	// * session cookie is signed with this secret to prevent tampering.
	secret: 'sjdkf^hsd983yh*&^wlkjdfh28AHJSD*aA&S',
	// * session cookie settings. (default: { path: '/', httpOnly: true, secure: false, maxAge: null })
	// cookie: {},
	// * function to call to generate a new session ID. (default: uses uid2 library)
	// genid: function() {},
	// * forces a cookie set on every response. This resets the expiration date. (default: false)
	rolling: false,
	// * forces session to be saved even when unmodified. (default: true)
	resave: true,
	// * trust the reverse proxy when setting secure cookies (via "x-forwarded-proto" header).
	// * When set to true, the "x-forwarded-proto" header will be used. When set to false, all
	// * headers are ignored. When left unset, will use the "trust proxy" setting from express.
	// * (default: undefined)
	proxy: undefined,
	// * forces a session that is "uninitialized" to be saved to the store. A session is
	// * uninitialized when it is new but not modified. This is useful for implementing login
	// * sessions, reducing server storage usage, or complying with laws that require permission
	// * before setting a cookie. (default: true)
	saveUninitialized: true,
	// * controls result of unsetting req.session (through delete, setting to null, etc.). This
	// * can be "keep" to keep the session in the store but ignore modifications or "destroy" to
	// * destroy the stored session. (default: 'keep')
	unset: 'keep'
};