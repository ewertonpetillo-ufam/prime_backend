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
exports.FREE_LIVING_DIARY_CSV_NAME = void 0;
exports.buildFreeLivingDiaryQuestionnaireCsv = buildFreeLivingDiaryQuestionnaireCsv;
var freeliving_diary_types_1 = require("./freeliving-diary.types");
var MAX_DOSE_SLOTS = 8;
function csvCell(value) {
    var text = value == null ? '' : String(value);
    if (text.includes(',') || text.includes('\n') || text.includes('"')) {
        return "\"".concat(text.replace(/"/g, '""'), "\"");
    }
    return text;
}
function isoDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString();
    }
    return value == null ? '' : String(value);
}
function boolCell(value) {
    if (value === true)
        return '1';
    if (value === false)
        return '0';
    return '';
}
function diaryCsvHeaders() {
    var headers = [
        'public_identifier',
        'diary_date',
        'protocol_day',
        'status',
        'save_count',
        'last_saved_at',
        'm1_label',
        'm2_label',
        'm3_label',
        'm4_label',
        'm5_label',
    ];
    for (var i = 1; i <= MAX_DOSE_SLOTS; i += 1) {
        headers.push("dose_".concat(i, "_time"), "dose_".concat(i, "_m1"), "dose_".concat(i, "_m2"), "dose_".concat(i, "_m3"), "dose_".concat(i, "_m4"), "dose_".concat(i, "_m5"), "dose_".concat(i, "_notes"));
    }
    var timed = __spreadArray(__spreadArray([], freeliving_diary_types_1.REQUIRED_TIMED_ACTIVITIES, true), freeliving_diary_types_1.OPTIONAL_TIMED_ACTIVITIES, true);
    for (var _i = 0, timed_1 = timed; _i < timed_1.length; _i++) {
        var key = timed_1[_i];
        headers.push("".concat(key, "_time"), "".concat(key, "_notes"));
    }
    for (var _a = 0, OPTIONAL_INTERVAL_ACTIVITIES_1 = freeliving_diary_types_1.OPTIONAL_INTERVAL_ACTIVITIES; _a < OPTIONAL_INTERVAL_ACTIVITIES_1.length; _a++) {
        var key = OPTIONAL_INTERVAL_ACTIVITIES_1[_a];
        headers.push("".concat(key, "_from"), "".concat(key, "_to"), "".concat(key, "_notes"));
    }
    for (var _b = 0, SYMPTOM_KEYS_1 = freeliving_diary_types_1.SYMPTOM_KEYS; _b < SYMPTOM_KEYS_1.length; _b++) {
        var symptom = SYMPTOM_KEYS_1[_b];
        for (var _c = 0, SYMPTOM_HOURS_1 = freeliving_diary_types_1.SYMPTOM_HOURS; _c < SYMPTOM_HOURS_1.length; _c++) {
            var hour = SYMPTOM_HOURS_1[_c];
            headers.push("".concat(symptom, "_").concat(hour, "h"));
        }
    }
    headers.push('watch_usage', 'phone_nearby', 'watch_removed_from', 'watch_removed_to', 'watch_removed_reason', 'device_problem', 'device_problem_detail', 'charged_end_of_day', 'sleep_with_smartwatch', 'day_notes');
    return headers;
}
function activityRow(activities, key) {
    var _a, _b, _c, _d, _e;
    var item = activities === null || activities === void 0 ? void 0 : activities[key];
    if ('from' in (item || {}) || freeliving_diary_types_1.OPTIONAL_INTERVAL_ACTIVITIES.includes(key)) {
        return [(_a = item === null || item === void 0 ? void 0 : item.from) !== null && _a !== void 0 ? _a : '', (_b = item === null || item === void 0 ? void 0 : item.to) !== null && _b !== void 0 ? _b : '', (_c = item === null || item === void 0 ? void 0 : item.notes) !== null && _c !== void 0 ? _c : ''];
    }
    return [(_d = item === null || item === void 0 ? void 0 : item.time) !== null && _d !== void 0 ? _d : '', (_e = item === null || item === void 0 ? void 0 : item.notes) !== null && _e !== void 0 ? _e : ''];
}
function buildFreeLivingDiaryQuestionnaireCsv(rows) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    var headers = diaryCsvHeaders();
    var lines = [headers.join(',')];
    for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
        var row = rows_1[_i];
        var payload = (row.payload || {});
        var labels = (_a = payload.medication) === null || _a === void 0 ? void 0 : _a.labels;
        var doses = Array.isArray((_b = payload.medication) === null || _b === void 0 ? void 0 : _b.doses)
            ? payload.medication.doses
            : [];
        var values = [
            row.publicIdentifier || '',
            row.diaryDate,
            row.protocolDay,
            row.status,
            (_c = row.saveCount) !== null && _c !== void 0 ? _c : '',
            isoDate(row.lastSavedAt),
            (_d = labels === null || labels === void 0 ? void 0 : labels.m1) !== null && _d !== void 0 ? _d : '',
            (_e = labels === null || labels === void 0 ? void 0 : labels.m2) !== null && _e !== void 0 ? _e : '',
            (_f = labels === null || labels === void 0 ? void 0 : labels.m3) !== null && _f !== void 0 ? _f : '',
            (_g = labels === null || labels === void 0 ? void 0 : labels.m4) !== null && _g !== void 0 ? _g : '',
            (_h = labels === null || labels === void 0 ? void 0 : labels.m5) !== null && _h !== void 0 ? _h : '',
        ];
        for (var i = 0; i < MAX_DOSE_SLOTS; i += 1) {
            var dose = doses[i];
            values.push((_j = dose === null || dose === void 0 ? void 0 : dose.time) !== null && _j !== void 0 ? _j : '', boolCell(dose === null || dose === void 0 ? void 0 : dose.m1), boolCell(dose === null || dose === void 0 ? void 0 : dose.m2), boolCell(dose === null || dose === void 0 ? void 0 : dose.m3), boolCell(dose === null || dose === void 0 ? void 0 : dose.m4), boolCell(dose === null || dose === void 0 ? void 0 : dose.m5), (_k = dose === null || dose === void 0 ? void 0 : dose.notes) !== null && _k !== void 0 ? _k : '');
        }
        var timed = __spreadArray(__spreadArray([], freeliving_diary_types_1.REQUIRED_TIMED_ACTIVITIES, true), freeliving_diary_types_1.OPTIONAL_TIMED_ACTIVITIES, true);
        for (var _x = 0, timed_2 = timed; _x < timed_2.length; _x++) {
            var key = timed_2[_x];
            values.push.apply(values, activityRow(payload.activities, key));
        }
        for (var _y = 0, OPTIONAL_INTERVAL_ACTIVITIES_2 = freeliving_diary_types_1.OPTIONAL_INTERVAL_ACTIVITIES; _y < OPTIONAL_INTERVAL_ACTIVITIES_2.length; _y++) {
            var key = OPTIONAL_INTERVAL_ACTIVITIES_2[_y];
            values.push.apply(values, activityRow(payload.activities, key));
        }
        for (var _z = 0, SYMPTOM_KEYS_2 = freeliving_diary_types_1.SYMPTOM_KEYS; _z < SYMPTOM_KEYS_2.length; _z++) {
            var symptom = SYMPTOM_KEYS_2[_z];
            var hours = (_l = payload.symptoms) === null || _l === void 0 ? void 0 : _l[symptom];
            for (var _0 = 0, SYMPTOM_HOURS_2 = freeliving_diary_types_1.SYMPTOM_HOURS; _0 < SYMPTOM_HOURS_2.length; _0++) {
                var hour = SYMPTOM_HOURS_2[_0];
                var score = hours === null || hours === void 0 ? void 0 : hours[hour];
                values.push(score == null ? '' : score);
            }
        }
        var devices = payload.devices;
        values.push((_m = devices === null || devices === void 0 ? void 0 : devices.watch_usage) !== null && _m !== void 0 ? _m : '', (_o = devices === null || devices === void 0 ? void 0 : devices.phone_nearby) !== null && _o !== void 0 ? _o : '', (_q = (_p = devices === null || devices === void 0 ? void 0 : devices.watch_removed) === null || _p === void 0 ? void 0 : _p.from) !== null && _q !== void 0 ? _q : '', (_s = (_r = devices === null || devices === void 0 ? void 0 : devices.watch_removed) === null || _r === void 0 ? void 0 : _r.to) !== null && _s !== void 0 ? _s : '', (_u = (_t = devices === null || devices === void 0 ? void 0 : devices.watch_removed) === null || _t === void 0 ? void 0 : _t.reason) !== null && _u !== void 0 ? _u : '', boolCell(devices === null || devices === void 0 ? void 0 : devices.device_problem), (_v = devices === null || devices === void 0 ? void 0 : devices.device_problem_detail) !== null && _v !== void 0 ? _v : '', boolCell(devices === null || devices === void 0 ? void 0 : devices.charged_end_of_day), boolCell(devices === null || devices === void 0 ? void 0 : devices.sleep_with_smartwatch), (_w = devices === null || devices === void 0 ? void 0 : devices.day_notes) !== null && _w !== void 0 ? _w : '');
        lines.push(values.map(csvCell).join(','));
    }
    return "".concat(lines.join('\n'), "\n");
}
exports.FREE_LIVING_DIARY_CSV_NAME = '06_Free_Living_Diary.csv';
