"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FREELIVING_DAY_STATUSES = exports.EXCLUDED_FREELIVING_PUBLIC_IDS = exports.ACTION_DIARY_SUBMITTED = exports.ACTION_DIARY_STARTED = exports.ACTION_COLLECTION_FINISHED = exports.ACTION_COLLECTION_STARTED = exports.SAO_PAULO_TZ = void 0;
exports.isExcludedFreelivingPublicId = isExcludedFreelivingPublicId;
exports.formatDateInTimeZone = formatDateInTimeZone;
exports.todayInSaoPaulo = todayInSaoPaulo;
exports.isIsoDateOnly = isIsoDateOnly;
exports.deriveDayStatus = deriveDayStatus;
exports.parseOptionalBoolean = parseOptionalBoolean;
exports.isUniqueViolation = isUniqueViolation;
exports.SAO_PAULO_TZ = 'America/Sao_Paulo';
exports.ACTION_COLLECTION_STARTED = 'collection_started';
exports.ACTION_COLLECTION_FINISHED = 'collection_finished';
exports.ACTION_DIARY_STARTED = 'diary_started';
exports.ACTION_DIARY_SUBMITTED = 'diary_submitted';
exports.EXCLUDED_FREELIVING_PUBLIC_IDS = ['P00', 'P000'];
function isExcludedFreelivingPublicId(publicIdentifier) {
    var normalized = (publicIdentifier || '').trim().toUpperCase();
    return exports.EXCLUDED_FREELIVING_PUBLIC_IDS.includes(normalized);
}
exports.FREELIVING_DAY_STATUSES = [
    'sem_acao',
    'iniciou',
    'finalizou',
    'iniciou_e_finalizou',
];
function formatDateInTimeZone(date, timeZone) {
    var _a, _b, _c, _d, _e, _f;
    if (timeZone === void 0) { timeZone = exports.SAO_PAULO_TZ; }
    var parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);
    var y = (_b = (_a = parts.find(function (p) { return p.type === 'year'; })) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '0000';
    var m = (_d = (_c = parts.find(function (p) { return p.type === 'month'; })) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : '01';
    var d = (_f = (_e = parts.find(function (p) { return p.type === 'day'; })) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : '01';
    return "".concat(y, "-").concat(m, "-").concat(d);
}
function todayInSaoPaulo(now) {
    if (now === void 0) { now = new Date(); }
    return formatDateInTimeZone(now, exports.SAO_PAULO_TZ);
}
function isIsoDateOnly(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
function deriveDayStatus(hasStarted, hasFinished) {
    if (hasStarted && hasFinished)
        return 'iniciou_e_finalizou';
    if (hasStarted)
        return 'iniciou';
    if (hasFinished)
        return 'finalizou';
    return 'sem_acao';
}
function parseOptionalBoolean(value) {
    if (value == null || value === '')
        return undefined;
    var normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'sim'].includes(normalized))
        return true;
    if (['false', '0', 'no', 'nao', 'não'].includes(normalized))
        return false;
    return undefined;
}
function isUniqueViolation(error) {
    var _a;
    if (!error || typeof error !== 'object')
        return false;
    var record = error;
    return record.code === '23505' || ((_a = record.driverError) === null || _a === void 0 ? void 0 : _a.code) === '23505';
}
