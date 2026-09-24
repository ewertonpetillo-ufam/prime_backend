"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFilledTime = isFilledTime;
exports.normalizeTime = normalizeTime;
exports.emptyTimedActivity = emptyTimedActivity;
exports.emptyIntervalActivity = emptyIntervalActivity;
exports.emptySymptomHours = emptySymptomHours;
exports.emptyDiaryPayload = emptyDiaryPayload;
exports.normalizeDiaryPayload = normalizeDiaryPayload;
exports.computeDiaryGaps = computeDiaryGaps;
exports.diaryStatusFromGaps = diaryStatusFromGaps;
exports.filledSectionCount = filledSectionCount;
exports.diarySectionSummary = diarySectionSummary;
exports.isIntervalFilled = isIntervalFilled;
exports.isTimedFilled = isTimedFilled;
exports.uuidV5FromName = uuidV5FromName;
exports.diaryMilestoneClientEventId = diaryMilestoneClientEventId;
exports.hasGap = hasGap;
var crypto_1 = require("crypto");
var freeliving_diary_types_1 = require("./freeliving-diary.types");
var TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
var DIARY_EVENT_NAMESPACE = '9f3c1a107b2e5d419c6a11f0c0ffeed1';
function isFilledTime(value) {
    return typeof value === 'string' && TIME_RE.test(value.trim());
}
function normalizeTime(value) {
    if (value == null || value === '')
        return null;
    if (typeof value !== 'string')
        return null;
    var trimmed = value.trim();
    if (!TIME_RE.test(trimmed)) {
        throw new Error("Hor\u00E1rio inv\u00E1lido: ".concat(value));
    }
    return trimmed;
}
function emptyTimedActivity() {
    return { time: null, notes: null };
}
function emptyIntervalActivity() {
    return { from: null, to: null, notes: null };
}
function emptySymptomHours() {
    return freeliving_diary_types_1.SYMPTOM_HOURS.reduce(function (acc, hour) {
        acc[hour] = null;
        return acc;
    }, {});
}
function emptyDiaryPayload() {
    return {
        medication: {
            labels: { m1: null, m2: null, m3: null, m4: null, m5: null },
            doses: [],
        },
        activities: {
            morning_hygiene: emptyTimedActivity(),
            meal_1: emptyTimedActivity(),
            meal_2: emptyTimedActivity(),
            meal_3: emptyTimedActivity(),
            short_walk: emptyTimedActivity(),
            spontaneous_walk: emptyTimedActivity(),
            arms_extended_1: emptyTimedActivity(),
            arms_extended_2: emptyTimedActivity(),
            other_activity: emptyTimedActivity(),
            rest_1: emptyIntervalActivity(),
            rest_2: emptyIntervalActivity(),
            rest_3: emptyIntervalActivity(),
            nap: emptyIntervalActivity(),
        },
        symptoms: {
            tremor: emptySymptomHours(),
            slowness: emptySymptomHours(),
            dyskinesia: emptySymptomHours(),
            walking: emptySymptomHours(),
            freezing: emptySymptomHours(),
        },
        devices: {
            watch_usage: null,
            phone_nearby: null,
            watch_removed: { from: null, to: null, reason: null },
            device_problem: null,
            device_problem_detail: null,
            charged_end_of_day: null,
            sleep_with_smartwatch: null,
            day_notes: null,
        },
    };
}
function asRecord(value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value;
    }
    return {};
}
function normalizeNullableString(value) {
    if (value == null)
        return null;
    var text = String(value).trim();
    return text.length > 0 ? text : null;
}
function normalizeBoolean(value) {
    if (value == null || value === '')
        return null;
    if (typeof value === 'boolean')
        return value;
    if (value === 1 || value === '1' || value === 'true')
        return true;
    if (value === 0 || value === '0' || value === 'false')
        return false;
    throw new Error('Valor booleano inválido');
}
function normalizeTimedActivity(raw) {
    var row = asRecord(raw);
    return {
        time: normalizeTime(row.time),
        notes: normalizeNullableString(row.notes),
    };
}
function normalizeIntervalActivity(raw) {
    var row = asRecord(raw);
    return {
        from: normalizeTime(row.from),
        to: normalizeTime(row.to),
        notes: normalizeNullableString(row.notes),
    };
}
function normalizeDose(raw) {
    var row = asRecord(raw);
    return {
        time: normalizeTime(row.time),
        m1: Boolean(row.m1),
        m2: Boolean(row.m2),
        m3: Boolean(row.m3),
        m4: Boolean(row.m4),
        m5: Boolean(row.m5),
        notes: normalizeNullableString(row.notes),
    };
}
function isValidDose(dose) {
    return Boolean(dose.time && (dose.m1 || dose.m2 || dose.m3 || dose.m4 || dose.m5));
}
function normalizeSymptomScore(value) {
    if (value == null || value === '')
        return null;
    var num = typeof value === 'number' ? value : Number(value);
    if (!Number.isInteger(num) || num < 0 || num > 3) {
        throw new Error("Intensidade de sintoma inv\u00E1lida: ".concat(value));
    }
    return num;
}
function mergeShallowBySection(base, incoming) {
    var _a, _b, _c, _d;
    var src = asRecord(incoming);
    return {
        medication: (_a = src.medication) !== null && _a !== void 0 ? _a : base.medication,
        activities: (_b = src.activities) !== null && _b !== void 0 ? _b : base.activities,
        symptoms: (_c = src.symptoms) !== null && _c !== void 0 ? _c : base.symptoms,
        devices: (_d = src.devices) !== null && _d !== void 0 ? _d : base.devices,
    };
}
function normalizeDiaryPayload(incoming, previous) {
    var _a, _b, _c, _d;
    var base = previous ? structuredClone(previous) : emptyDiaryPayload();
    var merged = asRecord(mergeShallowBySection(base, incoming));
    var medicationIn = asRecord(merged.medication);
    var labelsIn = asRecord(medicationIn.labels);
    var dosesRaw = Array.isArray(medicationIn.doses) ? medicationIn.doses : [];
    if (dosesRaw.length > 6) {
        throw new Error('São permitidas no máximo 6 doses');
    }
    var activitiesIn = asRecord(merged.activities);
    var symptomsIn = asRecord(merged.symptoms);
    var devicesIn = asRecord(merged.devices);
    var watchRemovedIn = asRecord(devicesIn.watch_removed);
    var watchUsage = (_a = devicesIn.watch_usage) !== null && _a !== void 0 ? _a : null;
    if (watchUsage != null &&
        !freeliving_diary_types_1.WATCH_USAGE_VALUES.includes(watchUsage)) {
        throw new Error("watch_usage inv\u00E1lido: ".concat(watchUsage));
    }
    var phoneNearby = (_b = devicesIn.phone_nearby) !== null && _b !== void 0 ? _b : null;
    if (phoneNearby != null &&
        !freeliving_diary_types_1.PHONE_NEARBY_VALUES.includes(phoneNearby)) {
        throw new Error("phone_nearby inv\u00E1lido: ".concat(phoneNearby));
    }
    var activities = __assign({}, emptyDiaryPayload().activities);
    for (var _i = 0, REQUIRED_TIMED_ACTIVITIES_1 = freeliving_diary_types_1.REQUIRED_TIMED_ACTIVITIES; _i < REQUIRED_TIMED_ACTIVITIES_1.length; _i++) {
        var key = REQUIRED_TIMED_ACTIVITIES_1[_i];
        activities[key] = normalizeTimedActivity(activitiesIn[key]);
    }
    for (var _e = 0, OPTIONAL_TIMED_ACTIVITIES_1 = freeliving_diary_types_1.OPTIONAL_TIMED_ACTIVITIES; _e < OPTIONAL_TIMED_ACTIVITIES_1.length; _e++) {
        var key = OPTIONAL_TIMED_ACTIVITIES_1[_e];
        activities[key] = normalizeTimedActivity(activitiesIn[key]);
    }
    for (var _f = 0, OPTIONAL_INTERVAL_ACTIVITIES_1 = freeliving_diary_types_1.OPTIONAL_INTERVAL_ACTIVITIES; _f < OPTIONAL_INTERVAL_ACTIVITIES_1.length; _f++) {
        var key = OPTIONAL_INTERVAL_ACTIVITIES_1[_f];
        activities[key] = normalizeIntervalActivity(activitiesIn[key]);
    }
    var symptoms = emptyDiaryPayload().symptoms;
    for (var _g = 0, SYMPTOM_KEYS_1 = freeliving_diary_types_1.SYMPTOM_KEYS; _g < SYMPTOM_KEYS_1.length; _g++) {
        var key = SYMPTOM_KEYS_1[_g];
        var hourMap = asRecord(symptomsIn[key]);
        for (var _h = 0, SYMPTOM_HOURS_1 = freeliving_diary_types_1.SYMPTOM_HOURS; _h < SYMPTOM_HOURS_1.length; _h++) {
            var hour = SYMPTOM_HOURS_1[_h];
            symptoms[key][hour] = normalizeSymptomScore(hourMap[hour]);
        }
    }
    return {
        medication: {
            labels: {
                m1: normalizeNullableString(labelsIn.m1),
                m2: normalizeNullableString(labelsIn.m2),
                m3: normalizeNullableString(labelsIn.m3),
                m4: normalizeNullableString(labelsIn.m4),
                m5: normalizeNullableString(labelsIn.m5),
            },
            doses: dosesRaw.map(normalizeDose),
        },
        activities: activities,
        symptoms: symptoms,
        devices: {
            watch_usage: (_c = watchUsage) !== null && _c !== void 0 ? _c : null,
            phone_nearby: (_d = phoneNearby) !== null && _d !== void 0 ? _d : null,
            watch_removed: {
                from: normalizeTime(watchRemovedIn.from),
                to: normalizeTime(watchRemovedIn.to),
                reason: normalizeNullableString(watchRemovedIn.reason),
            },
            device_problem: normalizeBoolean(devicesIn.device_problem),
            device_problem_detail: normalizeNullableString(devicesIn.device_problem_detail),
            charged_end_of_day: normalizeBoolean(devicesIn.charged_end_of_day),
            sleep_with_smartwatch: normalizeBoolean(devicesIn.sleep_with_smartwatch),
            day_notes: normalizeNullableString(devicesIn.day_notes),
        },
    };
}
function computeDiaryGaps(payload) {
    var gaps = [];
    if (!payload.medication.doses.some(isValidDose)) {
        gaps.push({
            path: 'medication.doses',
            label_pt: 'Pelo menos uma dose de medicação (horário + medicamento)',
        });
    }
    for (var _i = 0, REQUIRED_TIMED_ACTIVITIES_2 = freeliving_diary_types_1.REQUIRED_TIMED_ACTIVITIES; _i < REQUIRED_TIMED_ACTIVITIES_2.length; _i++) {
        var key = REQUIRED_TIMED_ACTIVITIES_2[_i];
        if (!isFilledTime(payload.activities[key].time)) {
            gaps.push({
                path: "activities.".concat(key, ".time"),
                label_pt: freeliving_diary_types_1.ACTIVITY_LABELS[key],
            });
        }
    }
    for (var _a = 0, SYMPTOM_KEYS_2 = freeliving_diary_types_1.SYMPTOM_KEYS; _a < SYMPTOM_KEYS_2.length; _a++) {
        var symptom = SYMPTOM_KEYS_2[_a];
        for (var _b = 0, SYMPTOM_HOURS_2 = freeliving_diary_types_1.SYMPTOM_HOURS; _b < SYMPTOM_HOURS_2.length; _b++) {
            var hour = SYMPTOM_HOURS_2[_b];
            if (payload.symptoms[symptom][hour] == null) {
                gaps.push({
                    path: "symptoms.".concat(symptom, ".").concat(hour),
                    label_pt: "".concat(freeliving_diary_types_1.SYMPTOM_LABELS[symptom], " \u00E0s ").concat(hour, "h"),
                });
            }
        }
    }
    var devices = payload.devices;
    if (devices.watch_usage == null) {
        gaps.push({
            path: 'devices.watch_usage',
            label_pt: 'Usou o relógio hoje?',
        });
    }
    if (devices.phone_nearby == null) {
        gaps.push({
            path: 'devices.phone_nearby',
            label_pt: 'Celular ligado/próximo?',
        });
    }
    if (devices.device_problem == null) {
        gaps.push({
            path: 'devices.device_problem',
            label_pt: 'Problema com relógio/celular?',
        });
    }
    if (devices.charged_end_of_day == null) {
        gaps.push({
            path: 'devices.charged_end_of_day',
            label_pt: 'Colocou celular e relógio para carregar no fim do dia?',
        });
    }
    if (devices.sleep_with_smartwatch == null) {
        gaps.push({
            path: 'devices.sleep_with_smartwatch',
            label_pt: 'Colocou o smartwatch para dormir?',
        });
    }
    if (devices.watch_usage === 'removed') {
        if (!isFilledTime(devices.watch_removed.from)) {
            gaps.push({
                path: 'devices.watch_removed.from',
                label_pt: 'Início do período sem relógio',
            });
        }
        if (!isFilledTime(devices.watch_removed.to)) {
            gaps.push({
                path: 'devices.watch_removed.to',
                label_pt: 'Fim do período sem relógio',
            });
        }
    }
    if (devices.device_problem === true && !devices.device_problem_detail) {
        gaps.push({
            path: 'devices.device_problem_detail',
            label_pt: 'Qual o problema com relógio/celular?',
        });
    }
    return gaps;
}
function diaryStatusFromGaps(gaps) {
    return gaps.length === 0 ? 'completo' : 'rascunho';
}
function filledSectionCount(gaps) {
    var missing = new Set(gaps.map(function (gap) { return gap.path.split('.')[0]; }));
    return freeliving_diary_types_1.DIARY_SECTIONS.filter(function (section) { return !missing.has(section); }).length;
}
function diarySectionSummary(gaps) {
    return {
        filledSectionCount: filledSectionCount(gaps),
        sectionCount: freeliving_diary_types_1.DIARY_SECTION_COUNT,
    };
}
function isIntervalFilled(value) {
    return isFilledTime(value.from) || isFilledTime(value.to) || Boolean(value.notes);
}
function isTimedFilled(value) {
    return isFilledTime(value.time) || Boolean(value.notes);
}
function uuidV5FromName(name) {
    var hash = (0, crypto_1.createHash)('sha1')
        .update(Buffer.from(DIARY_EVENT_NAMESPACE, 'hex'))
        .update(name)
        .digest();
    hash[6] = (hash[6] & 0x0f) | 0x50;
    hash[8] = (hash[8] & 0x3f) | 0x80;
    var hex = hash.subarray(0, 16).toString('hex');
    return "".concat(hex.slice(0, 8), "-").concat(hex.slice(8, 12), "-").concat(hex.slice(12, 16), "-").concat(hex.slice(16, 20), "-").concat(hex.slice(20, 32));
}
function diaryMilestoneClientEventId(diaryId, actionCode) {
    return uuidV5FromName("freeliving-diary:".concat(diaryId, ":").concat(actionCode));
}
function hasGap(gaps, path) {
    return gaps.some(function (gap) { return gap.path === path; });
}
