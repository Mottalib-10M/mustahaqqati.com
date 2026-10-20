#!/usr/bin/env python3
"""Construit src/data/params-2026.json à partir des barèmes officiels lus le 2026-10-20.
Chaque barème est une progression arithmétique (premier échelon + علاوة × (échelon − 1)) : on stocke les
deux nombres et le nombre d'échelons, et ce script vérifie chaque cellule contre la table officielle
recopiée ci-dessous (OFFICIEL_*), lue sur les PDF cités dans « sources »."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Sullam des fonctionnaires (أمر 4097/م ب du 25/6/1432 H), copie IAU : (1er échelon, علاوة, nb d'échelons)
GENERAL = {1:(3000,135,15),2:(3430,165,15),3:(3945,190,15),4:(4530,230,15),5:(5240,265,15),6:(6065,305,15),7:(7010,365,15),8:(8010,415,15),9:(9275,470,15),10:(10275,510,15),11:(11815,530,14),12:(13435,570,13),13:(15180,605,12),14:(17015,700,11),15:(20855,865,10)}
OFFICIEL_GENERAL_DERNIER = {1:4890,2:5740,3:6605,4:7750,5:8950,6:10335,7:12120,8:13820,9:15855,10:17415,11:18705,12:20275,13:21835,14:24015,15:28640}
# Barème des emplois d'enseignement (rangs de la لائحة الوظائف التعليمية, en vigueur le 10/11/1441 H), PDF moe.gov.sa
TEACH = {
 'musaid':     [(5200,300,6),(7000,320,6),(8920,340,6),(10960,360,6),(13120,380,6),(15400,400,6)],
 'mumaris':    [(7570,500,6),(10570,520,6),(13690,540,6),(16930,540,6),(20170,540,3)],
 'mutaqaddim': [(9950,540,6),(13190,560,6),(16550,580,6),(20030,580,4)],
 'khabir':     [(12650,600,6),(16250,620,6),(19970,640,6)],
}
OFFICIEL_TEACH_DERNIER = {'musaid':[6700,8600,10620,12760,15020,17400],'mumaris':[10070,13170,16390,19630,21250],'mutaqaddim':[12650,15990,19450,21770],'khabir':[15650,19350,23170]}
for g,(a,i,n) in GENERAL.items(): assert a+i*(n-1)==OFFICIEL_GENERAL_DERNIER[g], g
for r,L in TEACH.items():
    for k,(a,i,n) in enumerate(L): assert a+i*(n-1)==OFFICIEL_TEACH_DERNIER[r][k], (r,k)

S = lambda ar, url, date=None: {'label': {'ar': ar}, 'url': url, **({'date': date} if date else {})}
P = {
 'retrieved_at': '2026-10-20',
 'today': '2026-10-20',
 'hijriToday': '1448-05-09',
 'general': {
   'decree': '4097/م ب', 'from_hijri': '1432-06-25', 'from': '2011-05-28',
   'grades': {str(g): {'first': a, 'inc': i, 'steps': n} for g,(a,i,n) in GENERAL.items()},
 },
 'teachers': {
   'from_hijri': '1441-11-10', 'from': '2020-07-01',
   'ranks': {r: {'levels': [{'first': a, 'inc': i, 'steps': n} for (a,i,n) in L]} for r,L in TEACH.items()},
   # لائحة الوظائف التعليمية, art. 30 : مرتبة équivalente du سلم العام pour les indemnités, par rang et niveau
   'equiv': {'musaid': [5, 6, 7, 7, 8, 8], 'mumaris': [7, 8, 9, 9, 10], 'mutaqaddim': [8, 9, 10, 11], 'khabir': [10, 11, 12]},
   'names': {'musaid': 'مساعد معلم / معلم', 'mumaris': 'معلم ممارس', 'mutaqaddim': 'معلم متقدم', 'khabir': 'معلم خبير'},
 },
 # لائحة الحقوق والمزايا المالية, art. 36 : بدل الانتقال الشهري par مرتبة (la 15e n'y figure pas)
 'transport': [{'from': 1, 'to': 5, 'amount': 500}, {'from': 6, 'to': 10, 'amount': 700}, {'from': 11, 'to': 13, 'amount': 900}, {'from': 14, 'to': 14, 'amount': 1200}],
 # même لائحة, art. 6 : بدل الانتداب اليومي داخل المملكة par مرتبة
 'mission': [{'from': 1, 'to': 3, 'amount': 150}, {'from': 4, 'to': 5, 'amount': 200}, {'from': 6, 'to': 6, 'amount': 320}, {'from': 7, 'to': 8, 'amount': 400}, {'from': 9, 'to': 11, 'amount': 600}, {'from': 12, 'to': 13, 'amount': 700}, {'from': 14, 'to': 15, 'amount': 800}],
 # art. 6 : à l'étranger, par catégorie de pays (ج، ب، أ، مرتفعة المعيشة) ; art. 7 : ¼ si logé et nourri, ½ si logé ;
 # art. 36 : بدل انتقال إضافي = 1/30 du بدل الانتقال mensuel par jour de mission ; art. 6 : 300/jour pour 14 et 15 à l'étranger
 'missionAbroad': [{'from': 1, 'to': 3, 'c': 248, 'b': 270, 'a': 293, 'high': 315}, {'from': 4, 'to': 5, 'c': 330, 'b': 360, 'a': 390, 'high': 420}, {'from': 6, 'to': 6, 'c': 528, 'b': 576, 'a': 624, 'high': 672}, {'from': 7, 'to': 8, 'c': 660, 'b': 720, 'a': 780, 'high': 840}, {'from': 9, 'to': 11, 'c': 990, 'b': 1080, 'a': 1170, 'high': 1260}, {'from': 12, 'to': 13, 'c': 1155, 'b': 1260, 'a': 1365, 'high': 1470}, {'from': 14, 'to': 15, 'c': 1320, 'b': 1440, 'a': 1560, 'high': 1680}],
 'missionRules': {'housedFed': 0.25, 'housed': 0.5, 'extraTransportShare': 1/30, 'abroadTransport1415': 300, 'maxDays': 60, 'yearCap551': 30},
 'pension': {
   'civil': {'employee': 0.09, 'state': 0.09, 'divisor': 40, 'maxYears': 40, 'age': 60, 'serviceYears': 25, 'minServiceAt60': 10},
   'military': {'employee': 0.09, 'state': 0.13, 'divisor': 35},
   'privateOld': {'employee': 0.09, 'employer': 0.09, 'divisor': 40, 'avgMonths': 24, 'age': 60, 'ageWomen': 55, 'minMonths': 120, 'earlyMonths': 300, 'minPensionLaw': 1500},
   'newLaw': {
     'from': '2024-07-03', 'from_hijri': '1445-12-27', 'decree': 'م/273', 'decreeDate_hijri': '1445-12-26',
     'accrual': 0.0225, 'bestMonths': 180, 'maxRatio': 1, 'age': 65, 'minMonths': 180, 'earlyMonths': 360, 'earlyMaxMonths': 120,
     'earlyCutPerYear': 0.03, 'lateBonusPerYear': 0.03, 'minPensionFull': 4000, 'minPensionFullMonths': 480, 'minPensionAtMin': 2000, 'ceiling': 45000,
     'rates': [{'afterMonths': 0, 'total': 0.18}, {'afterMonths': 12, 'total': 0.19}, {'afterMonths': 24, 'total': 0.20}, {'afterMonths': 36, 'total': 0.21}, {'afterMonths': 48, 'total': 0.22}],
     'saned': 0.015,
     'transitionAge': [[29, 64*12+8], [30, 64*12+4], [31, 64*12], [32, 63*12+8], [33, 63*12+4], [34, 63*12], [35, 62*12+8], [36, 62*12+4], [37, 62*12], [38, 61*12+8], [39, 61*12+4], [40, 61*12], [41, 60*12+8], [42, 60*12+4], [43, 60*12], [44, 59*12+8], [45, 59*12+4], [46, 59*12], [47, 58*12+8], [48, 58*12+4]],
     'transitionEarly': [[180, 191, 348], [192, 203, 336], [204, 215, 324], [216, 227, 312], [228, 239, 300]],
   },
 },
 'eos': {'halfMonthYears': 5, 'resignation': [{'from': 0, 'to': 2, 'share': 0}, {'from': 2, 'to': 5, 'share': 1/3}, {'from': 5, 'to': 10, 'share': 2/3}, {'from': 10, 'to': 999, 'share': 1}], 'monthDays': 30},
 # برنامج حساب المواطن : valeurs renvoyées par la حاسبة تقديرية officielle le 2026-10-20 (aucune règle chiffrée publiée)
 'ca': {
   'observed': '2026-10-20', 'base': 720, 'adultW': 0.5, 'childW': 0.3, 'capW': 2.9, 'taper': 4310, 'stop': 6857, 'stopCap': 20001,
   'slope': 720/2547, 'floor': 400, 'extraUntil': '2026-12-31',
   'checks': [
     {'adults': 0, 'children': 0, 'income': 0, 'support': 720},
     {'adults': 1, 'children': 0, 'income': 0, 'support': 1080},
     {'adults': 0, 'children': 1, 'income': 0, 'support': 936},
     {'adults': 0, 'children': 6, 'income': 0, 'support': 2016},
     {'adults': 4, 'children': 0, 'income': 0, 'support': 2088},
     {'adults': 0, 'children': 0, 'income': 5200, 'support': 468},
     {'adults': 0, 'children': 0, 'income': 5450, 'support': 400},
     {'adults': 0, 'children': 0, 'income': 6857, 'support': 0},
     {'adults': 4, 'children': 0, 'income': 14000, 'support': 1736},
   ],
   'thresholds': [
     {'adults': 0, 'children': 0, 'taper': 4310, 'stop': 6857},
     {'adults': 1, 'children': 0, 'taper': 6465, 'stop': 10285},
     {'adults': 0, 'children': 1, 'taper': 5603, 'stop': 8914},
     {'adults': 0, 'children': 6, 'taper': 12068, 'stop': 19199},
   ],
 },
 'sources': {
   'iauGeneral': S('سلم رواتب الموظفين العام المعتمد بالأمر الكريم رقم (4097/م ب) وتاريخ 1432/6/25هـ، نسخة الإدارة العامة للموارد البشرية بجامعة الإمام عبدالرحمن بن فيصل', 'https://www.iau.edu.sa/sites/default/files/resources/employees_general_salaries_0.pdf'),
   'psauGeneral': S('سلم رواتب الموظفين، نسخة عمادة الموارد البشرية بجامعة الأمير سطام بن عبدالعزيز (ديسمبر 2024)', 'https://www.psau.edu.sa/dhr//sitesuploads/dhr/2024-12/%D9%88%D8%B8%D8%A7%D8%A6%D9%81%20%D8%A7%D9%84%D9%85%D9%88%D8%B8%D9%81%D9%8A%D9%86.pdf'),
   'spa1432': S('واس، 26/6/1432هـ: اعتماد 18 سلماً وجدولاً لرواتب الموظفين المدنيين اعتباراً من 25/6/1432هـ', 'https://www.spa.gov.sa/897663'),
   'moeTeachers': S('سلم رواتب وعلاوات الوظائف التعليمية، وزارة التعليم', 'https://www.moe.gov.sa/ar/aboutus/aboutministry/RPRLibrary/%D8%B3%D9%84%D9%85%20%D8%B1%D9%88%D8%A7%D8%AA%D8%A8%20%D8%A7%D9%84%D9%88%D8%B8%D8%A7%D8%A6%D9%81%20%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85%D9%8A%D8%A9%20%D8%A7%D9%84%D8%AC%D8%AF%D9%8A%D8%AF.pdf'),
   'spaTeachers': S('واس، 8/11/1441هـ: بدء العمل بلائحة الوظائف التعليمية في 10/11/1441هـ', 'https://www.spa.gov.sa/2103364'),
   'hrsdTeachers': S('لائحة الوظائف التعليمية، وزارة الموارد البشرية والتنمية الاجتماعية', 'https://www.hrsd.gov.sa/sites/default/files/2024-05/%D9%84%D8%A7%D8%A6%D8%AD%D8%A9%20%D8%A7%D9%84%D9%88%D8%B8%D8%A7%D8%A6%D9%81%20%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85%D9%8A%D8%A9.pdf'),
   'moeHuquq': S('لائحة الحقوق والمزايا المالية (طبعة 1439هـ)، مكتبة وزارة التعليم', 'https://www.moe.gov.sa/en/aboutus/aboutministry/RPRLibrary/%D9%84%D8%A7%D9%8A%D9%94%D8%AD%D8%A9%20%D8%A7%D9%84%D8%AD%D9%82%D9%88%D9%82%20%D9%88%D8%A7%D9%84%D9%85%D8%B2%D8%A7%D9%8A%D8%A7%20-%20%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%B1%D8%AF%20%D8%A7%D9%84%D8%A8%D8%B4%D8%B1%D9%8A%D8%A9.pdf'),
   'boeLabor': S('نظام العمل (المرسوم الملكي م/51 وتاريخ 23/8/1426هـ وتعديلاته)، هيئة الخبراء بمجلس الوزراء', 'https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/08381293-6388-48e2-8ad2-a9a700f2aa94/1'),
   'boeCivilService': S('نظام الخدمة المدنية (المرسوم الملكي م/49 وتاريخ 10/7/1397هـ)، هيئة الخبراء', 'https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/32f651e6-2976-439c-b418-a9a700f23fb2/1'),
   'boeSocialNew': S('نظام التأمينات الاجتماعية (المرسوم الملكي م/273 وتاريخ 26/12/1445هـ)، هيئة الخبراء', 'https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/eaee8a20-3a54-4aaf-b0d9-b1ad00998962/1'),
   'boeSocialOld': S('نظام التأمينات الاجتماعية (المرسوم الملكي م/33 وتاريخ 3/9/1421هـ)، هيئة الخبراء', 'https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/8ff3cd90-e466-4bf9-a071-a9a700f2a70d/1'),
   'boeCivilPension': S('نظام التقاعد المدني (المرسوم الملكي م/41 وتاريخ 29/7/1393هـ)، هيئة الخبراء', 'https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/859d4e56-627b-4766-a7aa-a9a700f23975/1'),
   'boeMilPension': S('نظام التقاعد العسكري (المرسوم الملكي م/24 وتاريخ 5/4/1395هـ)، هيئة الخبراء', 'https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/0838afd4-ca76-4b4a-b1d1-a9a700f22afd/1'),
   'caCalculator': S('الحاسبة التقديرية لبرنامج حساب المواطن', 'https://portal.ca.gov.sa/calculator'),
   'spaCa2026': S('واس، 11/6/1447هـ: تمديد الدعم الإضافي لحساب المواطن حتى نهاية 2026م', 'https://spa.gov.sa/N2457029'),
   'spaCaOct': S('واس، 30/4/1448هـ: إيداع دفعة أكتوبر 2026 لحساب المواطن', 'https://www.spa.gov.sa/N2698253'),
 },
}
out = os.path.join(ROOT, 'src/data/params-2026.json')
json.dump(P, open(out, 'w'), ensure_ascii=False, indent=1)
print('écrit', out)
