"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAGED_SLEEP_CSV_FILENAME_RE = exports.SPEECH_TASK_CODES = exports.SLEEP_TASK_CODE = exports.DEVICE_BREAKDOWN_TASK_CODES = void 0;
exports.isDeviceBreakdownTask = isDeviceBreakdownTask;
exports.isSpeechBreakdownTask = isSpeechBreakdownTask;
exports.hasNestedBreakdown = hasNestedBreakdown;
exports.isStagedSleepCsvFileName = isStagedSleepCsvFileName;
exports.emptyPdfPresence = emptyPdfPresence;
exports.normalizeTaskCode = normalizeTaskCode;
exports.resolveTaskCode = resolveTaskCode;
exports.pdfFilesTotal = pdfFilesTotal;
exports.reconcileBreakdownWithTaskTotal = reconcileBreakdownWithTaskTotal;
exports.applyPdfCountsToBreakdown = applyPdfCountsToBreakdown;
exports.isPolysomnographyEdf = isPolysomnographyEdf;
exports.classifyBinaryFileName = classifyBinaryFileName;
exports.emptyBreakdownForTask = emptyBreakdownForTask;
exports.incrementBreakdownCell = incrementBreakdownCell;
exports.applyPdfReportToPresence = applyPdfReportToPresence;
exports.daysSince = daysSince;
exports.riskFromDays = riskFromDays;
exports.listMissingDeviceKinds = listMissingDeviceKinds;
exports.buildPendingUploads = buildPendingUploads;
/** TAs com subcolunas Csv | Baiobit | Delsys. */
exports.DEVICE_BREAKDOWN_TASK_CODES = ['TA5', 'TA14', 'TA15', 'TA16'];
exports.SLEEP_TASK_CODE = 'TA13';
exports.SPEECH_TASK_CODES = ['TA10', 'TA11', 'TA12'];
/** CSV estagiado de sono: PXXX_TA13_XXXX.csv (ex.: P013_TA13_20260911.csv). */
exports.STAGED_SLEEP_CSV_FILENAME_RE = /^P\d+_TA13_.+\.csv$/i;
var DAY_MS = 24 * 60 * 60 * 1000;
function isDeviceBreakdownTask(taskCode) {
    return exports.DEVICE_BREAKDOWN_TASK_CODES.includes(taskCode);
}
function isSpeechBreakdownTask(taskCode) {
    return exports.SPEECH_TASK_CODES.includes(taskCode);
}
function hasNestedBreakdown(taskCode) {
    return (isDeviceBreakdownTask(taskCode) ||
        taskCode === exports.SLEEP_TASK_CODE ||
        isSpeechBreakdownTask(taskCode));
}
function isStagedSleepCsvFileName(fileName) {
    var base = ((fileName || '').trim().split(/[/\\]/).pop() || '').trim();
    return exports.STAGED_SLEEP_CSV_FILENAME_RE.test(base);
}
function emptyPdfPresence() {
    return {
        hasBaiobitPdf: false,
        hasDelsysPdf: false,
        hasPolysomnographyPdf: false,
        hasPolysomnographyEdf: false,
        baiobitPdfCount: 0,
        delsysPdfCount: 0,
        psgPdfCount: 0,
        psgEdfCount: 0,
    };
}
function normalizeTaskCode(raw) {
    var m = /^TA0*(\d{1,2})$/i.exec((raw || '').trim());
    return m ? "TA".concat(parseInt(m[1], 10)) : null;
}
function resolveTaskCode(taskId, metaTaskCode, taskIdToCode) {
    var _a;
    if (taskId != null && String(taskId).trim() !== '') {
        var n = Number(taskId);
        if (!Number.isNaN(n) && taskIdToCode.has(n)) {
            return (_a = taskIdToCode.get(n)) !== null && _a !== void 0 ? _a : null;
        }
    }
    return normalizeTaskCode(metaTaskCode);
}
function pdfFilesTotal(flags) {
    return flags.baiobitPdfCount + flags.delsysPdfCount + flags.psgPdfCount;
}
/** Arquivos já existentes entram sempre numa subcoluna visível (Csv/Áudio por omissão). */
function reconcileBreakdownWithTaskTotal(cell, taskTotal) {
    var classified = (cell.csv || 0) +
        (cell.baiobit || 0) +
        (cell.delsys || 0) +
        (cell.edf || 0) +
        (cell.audio || 0) +
        (cell.staged || 0);
    if (taskTotal > classified) {
        var leftover = taskTotal - classified;
        if (cell.audio != null)
            cell.audio += leftover;
        else
            cell.csv += leftover;
    }
}
function applyPdfCountsToBreakdown(breakdown, flags) {
    if (flags.baiobitPdfCount > 0 || flags.delsysPdfCount > 0) {
        for (var _i = 0, DEVICE_BREAKDOWN_TASK_CODES_1 = exports.DEVICE_BREAKDOWN_TASK_CODES; _i < DEVICE_BREAKDOWN_TASK_CODES_1.length; _i++) {
            var code = DEVICE_BREAKDOWN_TASK_CODES_1[_i];
            if (!breakdown[code])
                breakdown[code] = emptyBreakdownForTask(code);
            var cell = breakdown[code];
            if (cell.baiobit != null)
                cell.baiobit += flags.baiobitPdfCount;
            if (cell.delsys != null)
                cell.delsys += flags.delsysPdfCount;
        }
    }
    if (flags.psgPdfCount > 0 || flags.psgEdfCount > 0) {
        if (!breakdown[exports.SLEEP_TASK_CODE]) {
            breakdown[exports.SLEEP_TASK_CODE] = emptyBreakdownForTask(exports.SLEEP_TASK_CODE);
        }
        var cell = breakdown[exports.SLEEP_TASK_CODE];
        var nonEdf = Math.max(0, flags.psgPdfCount - flags.psgEdfCount);
        cell.csv += nonEdf;
        if (cell.edf != null)
            cell.edf += flags.psgEdfCount;
    }
}
/** PDF POLYSOMNOGRAPHY conta como EDF se o nome/mime indicar .edf. */
function isPolysomnographyEdf(fileName, mimeType) {
    var name = (fileName || '').trim();
    if (/\.edf(\.|$)/i.test(name) || /(^|[^a-z])edf([^a-z]|$)/i.test(name)) {
        return true;
    }
    var mime = (mimeType || '').toLowerCase();
    if (mime.includes('edf'))
        return true;
    return false;
}
function classifyBinaryFileName(fileName, taskCode, extras) {
    var name = (fileName || '').trim();
    var device = ((extras === null || extras === void 0 ? void 0 : extras.deviceType) || '').trim();
    var mime = ((extras === null || extras === void 0 ? void 0 : extras.mimeType) || '').trim();
    var haystack = "".concat(name, " ").concat(device).trim();
    var countsInCsvFallback = isDeviceBreakdownTask(taskCode) || taskCode === exports.SLEEP_TASK_CODE;
    if (taskCode === exports.SLEEP_TASK_CODE && isStagedSleepCsvFileName(name)) {
        return 'staged';
    }
    if (!haystack && !mime) {
        if (isSpeechBreakdownTask(taskCode))
            return 'audio';
        return countsInCsvFallback ? 'csv' : 'other';
    }
    if (/baiobit|biobit/i.test(haystack))
        return 'baiobit';
    if (/delsys|trigno|\bemg\b/i.test(haystack))
        return 'delsys';
    if (isPolysomnographyEdf(name, mime) ||
        (taskCode === exports.SLEEP_TASK_CODE && /\.edf/i.test(name))) {
        return 'edf';
    }
    if (/\.csv(\.|$)/i.test(name) || /csv/i.test(mime))
        return 'csv';
    if (isSpeechBreakdownTask(taskCode))
        return 'audio';
    if (countsInCsvFallback)
        return 'csv';
    return 'other';
}
function emptyBreakdownForTask(taskCode) {
    if (taskCode === exports.SLEEP_TASK_CODE) {
        return { csv: 0, edf: 0, staged: 0 };
    }
    if (isDeviceBreakdownTask(taskCode)) {
        return { csv: 0, baiobit: 0, delsys: 0 };
    }
    if (isSpeechBreakdownTask(taskCode)) {
        return { csv: 0, audio: 0 };
    }
    return { csv: 0 };
}
function incrementBreakdownCell(cell, kind) {
    if (kind === 'baiobit' && cell.baiobit != null)
        cell.baiobit += 1;
    else if (kind === 'delsys' && cell.delsys != null)
        cell.delsys += 1;
    else if (kind === 'edf' && cell.edf != null)
        cell.edf += 1;
    else if (kind === 'audio' && cell.audio != null)
        cell.audio += 1;
    else if (kind === 'staged' && cell.staged != null)
        cell.staged += 1;
    else if (kind === 'csv')
        cell.csv += 1;
}
function applyPdfReportToPresence(flags, reportType, fileName, mimeType) {
    var type = (reportType || '').trim().toUpperCase();
    var kind = classifyBinaryFileName(fileName, '', { mimeType: mimeType });
    if (type === 'BIOBIT') {
        flags.hasBaiobitPdf = true;
        flags.baiobitPdfCount += 1;
        return;
    }
    if (type === 'DELSYS') {
        flags.hasDelsysPdf = true;
        flags.delsysPdfCount += 1;
        return;
    }
    if (type === 'POLYSOMNOGRAPHY') {
        flags.hasPolysomnographyPdf = true;
        flags.psgPdfCount += 1;
        if (isPolysomnographyEdf(fileName, mimeType) || kind === 'edf') {
            flags.hasPolysomnographyEdf = true;
            flags.psgEdfCount += 1;
        }
        return;
    }
    if (kind === 'baiobit') {
        flags.hasBaiobitPdf = true;
        flags.baiobitPdfCount += 1;
    }
    else if (kind === 'delsys') {
        flags.hasDelsysPdf = true;
        flags.delsysPdfCount += 1;
    }
    else if (kind === 'edf' || isPolysomnographyEdf(fileName, mimeType)) {
        flags.hasPolysomnographyPdf = true;
        flags.hasPolysomnographyEdf = true;
        flags.psgPdfCount += 1;
        flags.psgEdfCount += 1;
    }
}
function daysSince(createdAt, nowMs) {
    if (!createdAt)
        return 0;
    var d = createdAt instanceof Date ? createdAt : new Date(createdAt);
    if (Number.isNaN(d.getTime()))
        return 0;
    return Math.max(0, Math.floor((nowMs - d.getTime()) / DAY_MS));
}
function riskFromDays(daysPending) {
    if (daysPending >= 7)
        return 7;
    if (daysPending >= 5)
        return 5;
    if (daysPending >= 3)
        return 3;
    return null;
}
function listMissingDeviceKinds(params) {
    var _a, _b, _c, _d, _e;
    var baiobitTotal = 0;
    var delsysTotal = 0;
    for (var _i = 0, DEVICE_BREAKDOWN_TASK_CODES_2 = exports.DEVICE_BREAKDOWN_TASK_CODES; _i < DEVICE_BREAKDOWN_TASK_CODES_2.length; _i++) {
        var code = DEVICE_BREAKDOWN_TASK_CODES_2[_i];
        var cell = params.deviceBreakdownByTask[code];
        baiobitTotal += (_a = cell === null || cell === void 0 ? void 0 : cell.baiobit) !== null && _a !== void 0 ? _a : 0;
        delsysTotal += (_b = cell === null || cell === void 0 ? void 0 : cell.delsys) !== null && _b !== void 0 ? _b : 0;
    }
    var hasBaiobit = baiobitTotal > 0 || !!params.hasBaiobitPdf;
    var hasDelsys = delsysTotal > 0 || !!params.hasDelsysPdf;
    var ta13Count = (_c = params.countsByTask[exports.SLEEP_TASK_CODE]) !== null && _c !== void 0 ? _c : 0;
    var edfCount = (_e = (_d = params.deviceBreakdownByTask[exports.SLEEP_TASK_CODE]) === null || _d === void 0 ? void 0 : _d.edf) !== null && _e !== void 0 ? _e : 0;
    var hasPolissonografo = edfCount > 0 || params.hasPolysomnographyEdf || params.hasPolysomnographyPdf;
    var sleepStarted = ta13Count > 0 ||
        params.hasPolysomnographyPdf ||
        params.hasPolysomnographyEdf;
    var out = [];
    if (!hasBaiobit)
        out.push('Baiobit');
    if (!hasDelsys)
        out.push('Delsys');
    if (sleepStarted && !hasPolissonografo)
        out.push('Polissonografo');
    return out;
}
function buildPendingUploads(params) {
    var days = daysSince(params.createdAt, params.nowMs);
    var risk = riskFromDays(days);
    if (!risk)
        return [];
    return listMissingDeviceKinds(params).map(function (kind) { return ({
        kind: kind,
        daysPending: days,
        risk: risk,
    }); });
}
