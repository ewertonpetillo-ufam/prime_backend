"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FREE_LIVING_PROTOCOL_TASK_CODES = exports.EXPECTED_BINARY_FILES_TOTAL = exports.EXPECTED_BINARY_FILES_BY_TASK = void 0;
exports.expectedFilesForTaskCode = expectedFilesForTaskCode;
exports.sumExpectedForTaskCodes = sumExpectedForTaskCodes;
exports.collectionProtocolStageForTaskCode = collectionProtocolStageForTaskCode;
exports.taskCodesInProtocolStage = taskCodesInProtocolStage;
exports.sortCollectionTaskCodes = sortCollectionTaskCodes;
/**
 * Meta de ficheiros por tarefa (CSV/WAV) conforme protocolo PRIME.
 * TA15: até 8 ficheiros por paciente (antes 12). Usado para KPIs e formatação da matriz.
 */
exports.EXPECTED_BINARY_FILES_BY_TASK = {
    TA1: 4,
    TA2: 4,
    TA3: 4,
    TA4: 4,
    TA5: 12,
    TA6: 1,
    TA7: 1,
    TA8: 2,
    TA9: 1,
    TA10: 4,
    TA11: 6,
    TA12: 6,
    TA13: 6,
    TA14: 12,
    TA15: 8,
    TA16: 36,
    TA17: 0,
};
/** Total de ficheiros binários esperados por paciente (soma das metas por TA). */
exports.EXPECTED_BINARY_FILES_TOTAL = Object.values(exports.EXPECTED_BINARY_FILES_BY_TASK).reduce(function (sum, n) { return sum + n; }, 0);
function expectedFilesForTaskCode(taskCode) {
    var _a;
    return (_a = exports.EXPECTED_BINARY_FILES_BY_TASK[taskCode]) !== null && _a !== void 0 ? _a : 0;
}
function sumExpectedForTaskCodes(taskCodes) {
    return taskCodes.reduce(function (sum, code) { return sum + expectedFilesForTaskCode(code); }, 0);
}
/** Tarefas do protocolo fora do consultório (FreeLiving). Meta de ficheiros: 0 até o protocolo fechar. */
exports.FREE_LIVING_PROTOCOL_TASK_CODES = ['FL01', 'FL02'];
function collectionProtocolStageForTaskCode(taskCode) {
    if (taskCode === 'TA13')
        return 'sleep';
    if (exports.FREE_LIVING_PROTOCOL_TASK_CODES.includes(taskCode))
        return 'free_living';
    return 'in_clinic';
}
function taskCodesInProtocolStage(stage, taskCodes) {
    return taskCodes.filter(function (c) { return collectionProtocolStageForTaskCode(c) === stage; });
}
/** TAs primeiro (ordem numérica), depois Free Living (FL01, FL02). */
function sortCollectionTaskCodes(codes) {
    var prefixRank = function (code) {
        var upper = (code || '').trim().toUpperCase();
        if (upper.startsWith('FL'))
            return 1;
        return 0;
    };
    return __spreadArray([], codes, true).sort(function (a, b) {
        var pr = prefixRank(a) - prefixRank(b);
        if (pr !== 0)
            return pr;
        var na = parseInt(a.replace(/\D/g, ''), 10) || 0;
        var nb = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return na - nb;
    });
}
