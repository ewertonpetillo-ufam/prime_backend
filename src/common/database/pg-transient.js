"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTransientPgError = isTransientPgError;
exports.withPgRetry = withPgRetry;
var TRANSIENT_PG_CODES = new Set([
    '57P01', // admin_shutdown
    '57P02', // crash_shutdown
    '57P03', // cannot_connect_now
    '08000', // connection_exception
    '08001', // sqlclient_unable_to_establish_sqlconnection
    '08003', // connection_does_not_exist
    '08006', // connection_failure
    '08004', // sqlserver_rejected_establishment_of_sqlconnection
    '53300', // too_many_connections
]);
var TRANSIENT_NODE_CODES = new Set([
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'EPIPE',
    'ENOTFOUND',
    'EAI_AGAIN',
]);
var TRANSIENT_MESSAGE_PATTERNS = [
    /connection terminated/i,
    /not yet accepting connections/i,
    /the database system is in recovery mode/i,
    /the database system is shutting down/i,
    /the database system is starting up/i,
    /sorry, too many clients already/i,
    /remaining connection slots are reserved/i,
    /server closed the connection unexpectedly/i,
    /cannot connect now/i,
    /client has encountered a connection error/i,
    /connection refused/i,
    /timeout expired/i,
];
var sleep = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
function collectErrorParts(error) {
    var codes = [];
    var messages = [];
    var seen = new Set();
    var visit = function (value, depth) {
        if (value == null || depth > 4 || seen.has(value))
            return;
        if (typeof value === 'string') {
            messages.push(value);
            return;
        }
        if (typeof value !== 'object')
            return;
        seen.add(value);
        var record = value;
        if (typeof record.code === 'string')
            codes.push(record.code);
        if (typeof record.message === 'string')
            messages.push(record.message);
        visit(record.driverError, depth + 1);
        visit(record.original, depth + 1);
        visit(record.cause, depth + 1);
    };
    visit(error, 0);
    if (error instanceof Error && error.stack)
        messages.push(error.stack);
    return { codes: codes, messages: messages };
}
function isTransientPgError(error) {
    var _a = collectErrorParts(error), codes = _a.codes, messages = _a.messages;
    if (codes.some(function (code) { return TRANSIENT_PG_CODES.has(code) || TRANSIENT_NODE_CODES.has(code); })) {
        return true;
    }
    return messages.some(function (message) {
        return TRANSIENT_MESSAGE_PATTERNS.some(function (pattern) { return pattern.test(message); });
    });
}
function withPgRetry(operation_1) {
    return __awaiter(this, arguments, void 0, function (operation, options) {
        var retries, baseDelayMs, maxDelayMs, lastError, attempt, error_1, canRetry, delayMs;
        var _a, _b, _c, _d, _e;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    retries = (_a = options.retries) !== null && _a !== void 0 ? _a : 8;
                    baseDelayMs = (_b = options.baseDelayMs) !== null && _b !== void 0 ? _b : 750;
                    maxDelayMs = (_c = options.maxDelayMs) !== null && _c !== void 0 ? _c : 8000;
                    attempt = 1;
                    _f.label = 1;
                case 1:
                    if (!(attempt <= retries + 1)) return [3 /*break*/, 7];
                    if ((_d = options.shouldAbort) === null || _d === void 0 ? void 0 : _d.call(options)) {
                        throw lastError !== null && lastError !== void 0 ? lastError : new Error('Operação abortada durante retry do PostgreSQL');
                    }
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 4, , 6]);
                    return [4 /*yield*/, operation()];
                case 3: return [2 /*return*/, _f.sent()];
                case 4:
                    error_1 = _f.sent();
                    lastError = error_1;
                    canRetry = attempt <= retries && isTransientPgError(error_1);
                    if (!canRetry)
                        throw error_1;
                    delayMs = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, (attempt - 1)));
                    (_e = options.onRetry) === null || _e === void 0 ? void 0 : _e.call(options, error_1, attempt, delayMs);
                    return [4 /*yield*/, sleep(delayMs)];
                case 5:
                    _f.sent();
                    return [3 /*break*/, 6];
                case 6:
                    attempt++;
                    return [3 /*break*/, 1];
                case 7: throw lastError;
            }
        });
    });
}
