## Project Name
2026_UFAM_Parkinson_1

## Purpose
To collect data for developing non-invasive models for Parkinson's disease detection and monitoring of motor (tremor, bradykinesia, freezing of gait, arm swing disturbances) and non-motor (speech, typing) symptoms using commercial Samsung Galaxy Watch 8, smartphone, and polysomnography in Healthy, Early, and Advanced Parkinson's disease populations across in-clinic and free-living settings.

## Field of Study
Non-Invasive Multimodal Assessment of Parkinson Disease Detection and Progression Using Smartwatch (PPG, IMU) and Smartphone (Speech, Typing) Biomarkers in Healthy Controls and Parkinson Disease Populations

## Equipment
- Test: Samsung Galaxy Watch 8 (44mm) LTE (Model: SM-L335F) | Visits: In-Clinic, Polysomnography, Free-Living
- Smartphone (Samsung Galaxy A56) for speech feature CSVs and symptom diary
- Reference: Baiobit System, Surface Electromyography (EMG), PSG Type III

## Collection Environment
- Collection site: UFAM (Universidade Federal do Amazonas) / Manaus, Brazil
- Timezone: -04:00 (Amazonas, UTC-4)
- Activities: In-Clinic visit, PSG, and free-living period (symptom diary, Samsung Health, smartwatch raw sensors)

## Project Period
2025-07-01 ~ 2027-06-30

## Collection Protocol
Three-Phase Protocol: In-Clinic baseline assessment with Parkinson-specific scales and consent, Polysomnographic monitoring with synchronized smartwatch data and sleep disorder annotations, and 7-day free-living acquisition of continuous sensor data (PPG, IMU), symptom diaries, and smartphone-based behavioral biomarkers (speech features) in Healthy and Parkinson Cohorts.

## Channel Configuration
- GW8 (Samsung Health): dump
- GW8 (SDK): 3-axis ACC, PPG green
- Baiobit: motion reference
- EMG: surface electromyography
- PSG: Type III annotations
- Smartphone: speech feature CSVs; free-living symptom diary

## File Format
- GW8_PrimeInClinic: accelerometer.csv, ppg.csv, or taN_*.csv
- GW8_PrimeFreeLiving: accelerometer.csv, ppg.csv, or fl*.csv
- GW8_SamsungHealth: com.samsung.health.*.csv
- SP_PrimeInClinic: features_ta10.csv, features_ta11.csv, features_ta12.csv
- SP_SymptomsDiary: annotations.csv
- PSG_Annotations: annotations.edf, annotations.csv
- Baiobit / EMG: device report and binary files
- User_Data: demographics.csv, motorevaluation.csv, sleepevaluation.csv, fogevaluation.csv, speechtherapy.csv

## Subject Count
200 In-Clinic, 80 PSG, 90 Free-Living

## Subject Characteristics
Healthy, Early Parkinson, Advanced Parkinson

## Measurement Time per Subject
- Visit 1 (In-Clinic): 2-4 hours
- Visit 2 (PSG): up to 12 hours
- Free-Living: 7 days with up to 8 hours daily using the commercial watch and up to 12 hours nightly using the smartwatch

## Label Info
Motor evaluation (User_Data → motorevaluation.csv) serves as reference for motor symptom detection.
Symptom diary (SP_SymptomsDiary → annotations.csv) provides ground-truth symptom annotations.
Sleep evaluation (User_Data → sleepevaluation.csv) serves as reference for sleep quality.
Polysomnography (PSG_Annotations → annotations.edf / annotations.csv) serves as reference for sleep architecture.
In-clinic and free-living sensor data provide motor patterns in controlled and real-world settings.
