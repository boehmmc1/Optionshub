import React, { useState, useMemo, useEffect } from 'react';

// =============================================================================
// Embedded screening data — extracted from the 9 source XLSX files.
// Regenerate via scripts/build-screenings-data.py whenever the source XLSX files update.
// =============================================================================
const SCREENINGS_RAW = `[{"id":"hohe-iv","title":"Hohe IV-Screening mit Sicherheitspuffer","shortLabel":"Hohe IV","tagline":"Hoher Sicherheitspuffer","category":"stillhalter","icon":"🛡","accent":"emerald","filters":{"options":["Laufzeit zwischen 10 und 14 Tagen","Delta -0,3 bis -0,2","Annualisierte Stillhalterrendite > 20 %","Abstand zum Geld mind. 8 %","IV-Rank > 75 %","IV > 50 %","Optionsauslauf vor Earnings"],"technical":["keine"],"fundamental":["Marktkapitalisierung > 5 Milliarden $","Aktienpreis zwischen 10 $ und 200 $"]},"stats":{"count":77,"avgReturn":0.7359675324675324,"maxReturn":1.2064,"avgIvRank":0.8378025974025974},"results":[{"name":"Adv Micro Devices","price":424.1,"iv":0.693,"ivRank":0.7756,"type":"Put","strike":390.0,"strikeDist":-0.0804,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":8.2,"annualReturn":0.5429},{"name":"Adv Micro Devices","price":424.1,"iv":0.6857,"ivRank":0.7756,"type":"Put","strike":387.5,"strikeDist":-0.0863,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":7.4,"annualReturn":0.4899},{"name":"Adv Micro Devices","price":424.1,"iv":0.704,"ivRank":0.7756,"type":"Put","strike":385.0,"strikeDist":-0.0922,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":7.18,"annualReturn":0.475},{"name":"Ast Spacemobile Inc","price":83.67,"iv":1.0501,"ivRank":0.7762,"type":"Put","strike":76.0,"strikeDist":-0.0917,"expiry":"2026-05-29","earnings":"2026-08-10","endsBeforeEarnings":"Yes","optionPrice":3.23,"annualReturn":1.0822},{"name":"Ast Spacemobile Inc","price":83.67,"iv":1.0452,"ivRank":0.7762,"type":"Put","strike":75.0,"strikeDist":-0.1036,"expiry":"2026-05-29","earnings":"2026-08-10","endsBeforeEarnings":"Yes","optionPrice":2.92,"annualReturn":0.9782},{"name":"Ast Spacemobile Inc","price":83.67,"iv":1.0431,"ivRank":0.7762,"type":"Put","strike":74.0,"strikeDist":-0.1156,"expiry":"2026-05-29","earnings":"2026-08-10","endsBeforeEarnings":"Yes","optionPrice":2.54,"annualReturn":0.8523},{"name":"Ast Spacemobile Inc","price":83.67,"iv":1.0703,"ivRank":0.7762,"type":"Put","strike":73.0,"strikeDist":-0.1275,"expiry":"2026-05-29","earnings":"2026-08-10","endsBeforeEarnings":"Yes","optionPrice":2.27,"annualReturn":0.7601},{"name":"Ciena Corp","price":554.46,"iv":0.8557,"ivRank":0.9785,"type":"Put","strike":510.0,"strikeDist":-0.0802,"expiry":"2026-05-29","earnings":"2026-06-04","endsBeforeEarnings":"Yes","optionPrice":16.95,"annualReturn":0.8583},{"name":"Ciena Corp","price":554.46,"iv":0.81,"ivRank":0.9785,"type":"Put","strike":505.0,"strikeDist":-0.0892,"expiry":"2026-05-29","earnings":"2026-06-04","endsBeforeEarnings":"Yes","optionPrice":14.4,"annualReturn":0.7292},{"name":"Ciena Corp","price":554.46,"iv":0.8677,"ivRank":0.9785,"type":"Put","strike":500.0,"strikeDist":-0.0982,"expiry":"2026-05-29","earnings":"2026-06-04","endsBeforeEarnings":"Yes","optionPrice":13.95,"annualReturn":0.7064},{"name":"Ciena Corp","price":554.46,"iv":0.8749,"ivRank":0.9785,"type":"Put","strike":495.0,"strikeDist":-0.1072,"expiry":"2026-05-29","earnings":"2026-06-04","endsBeforeEarnings":"Yes","optionPrice":12.45,"annualReturn":0.6304},{"name":"Ciena Corp","price":554.46,"iv":0.8415,"ivRank":0.9785,"type":"Put","strike":492.5,"strikeDist":-0.1117,"expiry":"2026-05-29","earnings":"2026-06-04","endsBeforeEarnings":"Yes","optionPrice":10.9,"annualReturn":0.552},{"name":"Ciena Corp","price":554.46,"iv":0.8851,"ivRank":0.9785,"type":"Put","strike":490.0,"strikeDist":-0.1163,"expiry":"2026-05-29","earnings":"2026-06-04","endsBeforeEarnings":"Yes","optionPrice":11.45,"annualReturn":0.5798},{"name":"Coherent Corp","price":382.45,"iv":0.9699,"ivRank":0.8066,"type":"Put","strike":350.0,"strikeDist":-0.0848,"expiry":"2026-05-29","earnings":"2026-08-12","endsBeforeEarnings":"Yes","optionPrice":13.4,"annualReturn":0.9837},{"name":"Coherent Corp","price":382.45,"iv":0.9036,"ivRank":0.8066,"type":"Put","strike":347.5,"strikeDist":-0.0914,"expiry":"2026-05-29","earnings":"2026-08-12","endsBeforeEarnings":"Yes","optionPrice":12.15,"annualReturn":0.892},{"name":"Coherent Corp","price":382.45,"iv":0.9373,"ivRank":0.8066,"type":"Put","strike":345.0,"strikeDist":-0.0979,"expiry":"2026-05-29","earnings":"2026-08-12","endsBeforeEarnings":"Yes","optionPrice":11.45,"annualReturn":0.8406},{"name":"Coherent Corp","price":382.45,"iv":0.9171,"ivRank":0.8066,"type":"Put","strike":342.5,"strikeDist":-0.1045,"expiry":"2026-05-29","earnings":"2026-08-12","endsBeforeEarnings":"Yes","optionPrice":10.7,"annualReturn":0.7855},{"name":"Coherent Corp","price":382.45,"iv":0.9027,"ivRank":0.8066,"type":"Put","strike":340.0,"strikeDist":-0.111,"expiry":"2026-05-29","earnings":"2026-08-12","endsBeforeEarnings":"Yes","optionPrice":9.85,"annualReturn":0.7231},{"name":"Coherent Corp","price":382.45,"iv":1.001,"ivRank":0.8066,"type":"Put","strike":337.5,"strikeDist":-0.1175,"expiry":"2026-05-29","earnings":"2026-08-12","endsBeforeEarnings":"Yes","optionPrice":9.5,"annualReturn":0.6974},{"name":"Docusign Inc","price":47.71,"iv":0.8952,"ivRank":0.8477,"type":"Put","strike":43.5,"strikeDist":-0.0882,"expiry":"2026-05-29","earnings":"2026-06-04","endsBeforeEarnings":"Yes","optionPrice":1.4,"annualReturn":0.8209},{"name":"Enphase Energy Inc","price":52.89,"iv":0.9506,"ivRank":0.7763,"type":"Put","strike":48.0,"strikeDist":-0.0925,"expiry":"2026-05-29","earnings":"2026-07-28","endsBeforeEarnings":"Yes","optionPrice":1.66,"annualReturn":0.8786},{"name":"Enphase Energy Inc","price":52.89,"iv":0.9765,"ivRank":0.7763,"type":"Put","strike":47.5,"strikeDist":-0.1019,"expiry":"2026-05-29","earnings":"2026-07-28","endsBeforeEarnings":"Yes","optionPrice":1.69,"annualReturn":0.8971},{"name":"Enphase Energy Inc","price":52.89,"iv":0.9482,"ivRank":0.7763,"type":"Put","strike":47.0,"strikeDist":-0.1114,"expiry":"2026-05-29","earnings":"2026-07-28","endsBeforeEarnings":"Yes","optionPrice":1.35,"annualReturn":0.714},{"name":"Futu Holdings Ltd ADR","price":134.64,"iv":0.7388,"ivRank":0.801,"type":"Put","strike":122.45,"strikeDist":-0.0905,"expiry":"2026-05-29","earnings":"2026-06-04","endsBeforeEarnings":"Yes","optionPrice":2.54,"annualReturn":0.5286},{"name":"Corning Inc","price":191.81,"iv":0.7285,"ivRank":0.8727,"type":"Put","strike":175.0,"strikeDist":-0.0876,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":3.68,"annualReturn":0.5379},{"name":"Intel Corp","price":108.77,"iv":0.8089,"ivRank":0.7529,"type":"Put","strike":100.0,"strikeDist":-0.0806,"expiry":"2026-05-29","earnings":"2026-07-23","endsBeforeEarnings":"Yes","optionPrice":2.86,"annualReturn":0.7383},{"name":"Intel Corp","price":108.77,"iv":0.8048,"ivRank":0.7529,"type":"Put","strike":99.0,"strikeDist":-0.0898,"expiry":"2026-05-29","earnings":"2026-07-23","endsBeforeEarnings":"Yes","optionPrice":2.63,"annualReturn":0.6776},{"name":"Intel Corp","price":108.77,"iv":0.834,"ivRank":0.7529,"type":"Put","strike":98.0,"strikeDist":-0.099,"expiry":"2026-05-29","earnings":"2026-07-23","endsBeforeEarnings":"Yes","optionPrice":2.35,"annualReturn":0.6066},{"name":"Intel Corp","price":108.77,"iv":0.8317,"ivRank":0.7529,"type":"Put","strike":97.0,"strikeDist":-0.1082,"expiry":"2026-05-29","earnings":"2026-07-23","endsBeforeEarnings":"Yes","optionPrice":2.16,"annualReturn":0.5576},{"name":"Samsara Inc Cl A","price":29.56,"iv":0.6776,"ivRank":0.9082,"type":"Put","strike":27.0,"strikeDist":-0.0866,"expiry":"2026-05-29","earnings":"2026-06-04","endsBeforeEarnings":"Yes","optionPrice":0.5,"annualReturn":0.4749},{"name":"Lam Research Corp","price":284.72,"iv":0.6643,"ivRank":0.7773,"type":"Put","strike":260.0,"strikeDist":-0.0868,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":4.8,"annualReturn":0.4733},{"name":"Micron Technology","price":724.66,"iv":0.9297,"ivRank":0.8425,"type":"Put","strike":665.0,"strikeDist":-0.0823,"expiry":"2026-05-29","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":24.25,"annualReturn":0.9396},{"name":"Micron Technology","price":724.66,"iv":0.9324,"ivRank":0.8425,"type":"Put","strike":662.5,"strikeDist":-0.0858,"expiry":"2026-05-29","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":23.45,"annualReturn":0.9086},{"name":"Micron Technology","price":724.66,"iv":0.9247,"ivRank":0.8425,"type":"Put","strike":660.0,"strikeDist":-0.0892,"expiry":"2026-05-29","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":22.5,"annualReturn":0.8718},{"name":"Micron Technology","price":724.66,"iv":0.9199,"ivRank":0.8425,"type":"Put","strike":657.5,"strikeDist":-0.0927,"expiry":"2026-05-29","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":21.88,"annualReturn":0.8475},{"name":"Micron Technology","price":724.66,"iv":0.9305,"ivRank":0.8425,"type":"Put","strike":655.0,"strikeDist":-0.0961,"expiry":"2026-05-29","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":20.95,"annualReturn":0.8117},{"name":"Micron Technology","price":724.66,"iv":0.9355,"ivRank":0.8425,"type":"Put","strike":652.5,"strikeDist":-0.0996,"expiry":"2026-05-29","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":20.4,"annualReturn":0.7904},{"name":"Micron Technology","price":724.66,"iv":0.9315,"ivRank":0.8425,"type":"Put","strike":650.0,"strikeDist":-0.103,"expiry":"2026-05-29","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":19.6,"annualReturn":0.7594},{"name":"Micron Technology","price":724.66,"iv":0.9386,"ivRank":0.8425,"type":"Put","strike":647.5,"strikeDist":-0.1065,"expiry":"2026-05-29","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":19.05,"annualReturn":0.7381},{"name":"Micron Technology","price":724.66,"iv":0.9408,"ivRank":0.8425,"type":"Put","strike":645.0,"strikeDist":-0.1099,"expiry":"2026-05-29","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":18.43,"annualReturn":0.7139},{"name":"Micron Technology","price":724.66,"iv":0.9352,"ivRank":0.8425,"type":"Put","strike":642.5,"strikeDist":-0.1134,"expiry":"2026-05-29","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":17.7,"annualReturn":0.6858},{"name":"Micron Technology","price":724.66,"iv":0.9472,"ivRank":0.8425,"type":"Put","strike":640.0,"strikeDist":-0.1168,"expiry":"2026-05-29","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":17.3,"annualReturn":0.6703},{"name":"Micron Technology","price":724.66,"iv":0.9444,"ivRank":0.8425,"type":"Put","strike":637.5,"strikeDist":-0.1203,"expiry":"2026-05-29","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":16.53,"annualReturn":0.6403},{"name":"Nebius Group N.V. Cl A","price":219.94,"iv":1.1217,"ivRank":0.8835,"type":"Put","strike":200.0,"strikeDist":-0.0907,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":9.45,"annualReturn":1.2064},{"name":"Nebius Group N.V. Cl A","price":219.94,"iv":1.121,"ivRank":0.8835,"type":"Put","strike":197.5,"strikeDist":-0.102,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":8.73,"annualReturn":1.1138},{"name":"Nebius Group N.V. Cl A","price":219.94,"iv":1.1237,"ivRank":0.8835,"type":"Put","strike":195.0,"strikeDist":-0.1134,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":7.95,"annualReturn":1.0149},{"name":"Nebius Group N.V. Cl A","price":219.94,"iv":1.1465,"ivRank":0.8835,"type":"Put","strike":192.5,"strikeDist":-0.1248,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":7.23,"annualReturn":0.9223},{"name":"Nebius Group N.V. Cl A","price":219.94,"iv":1.1537,"ivRank":0.8835,"type":"Put","strike":190.0,"strikeDist":-0.1361,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":6.55,"annualReturn":0.8362},{"name":"Nebius Group N.V. Cl A","price":219.94,"iv":1.1928,"ivRank":0.8835,"type":"Put","strike":187.5,"strikeDist":-0.1475,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":5.95,"annualReturn":0.7596},{"name":"Oracle Corp","price":192.95,"iv":0.575,"ivRank":0.8644,"type":"Put","strike":177.5,"strikeDist":-0.0801,"expiry":"2026-05-29","earnings":"2026-06-10","endsBeforeEarnings":"Yes","optionPrice":2.51,"annualReturn":0.3652},{"name":"Planet Labs Pbc","price":41.62,"iv":0.8976,"ivRank":0.8798,"type":"Put","strike":38.0,"strikeDist":-0.087,"expiry":"2026-05-29","earnings":"2026-06-04","endsBeforeEarnings":"Yes","optionPrice":1.2,"annualReturn":0.8095},{"name":"Planet Labs Pbc","price":41.62,"iv":0.883,"ivRank":0.8798,"type":"Put","strike":37.5,"strikeDist":-0.099,"expiry":"2026-05-29","earnings":"2026-06-04","endsBeforeEarnings":"Yes","optionPrice":1.28,"annualReturn":0.8601},{"name":"Planet Labs Pbc","price":41.62,"iv":0.878,"ivRank":0.8798,"type":"Put","strike":37.0,"strikeDist":-0.111,"expiry":"2026-05-29","earnings":"2026-06-04","endsBeforeEarnings":"Yes","optionPrice":1.2,"annualReturn":0.8095},{"name":"Planet Labs Pbc","price":41.62,"iv":0.9356,"ivRank":0.8798,"type":"Put","strike":36.5,"strikeDist":-0.123,"expiry":"2026-05-29","earnings":"2026-06-04","endsBeforeEarnings":"Yes","optionPrice":0.95,"annualReturn":0.6409},{"name":"Qualcomm Inc","price":201.49,"iv":0.6587,"ivRank":0.7669,"type":"Put","strike":185.0,"strikeDist":-0.0818,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":3.83,"annualReturn":0.5337},{"name":"Qualcomm Inc","price":201.49,"iv":0.724,"ivRank":0.7669,"type":"Put","strike":182.5,"strikeDist":-0.0942,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":3.56,"annualReturn":0.4954},{"name":"Qxo Inc","price":16.33,"iv":0.6025,"ivRank":0.9989,"type":"Put","strike":15.0,"strikeDist":-0.0814,"expiry":"2026-05-29","earnings":"2026-08-13","endsBeforeEarnings":"Yes","optionPrice":0.33,"annualReturn":0.5588},{"name":"Rocket Lab Corporation","price":124.77,"iv":0.9369,"ivRank":0.7596,"type":"Put","strike":114.0,"strikeDist":-0.0863,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":4.4,"annualReturn":0.9901},{"name":"Rocket Lab Corporation","price":124.77,"iv":0.9795,"ivRank":0.7596,"type":"Put","strike":113.0,"strikeDist":-0.0943,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":3.54,"annualReturn":0.7955},{"name":"Rocket Lab Corporation","price":124.77,"iv":0.9711,"ivRank":0.7596,"type":"Put","strike":112.0,"strikeDist":-0.1023,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":3.8,"annualReturn":0.8551},{"name":"Rocket Lab Corporation","price":124.77,"iv":0.9785,"ivRank":0.7596,"type":"Put","strike":111.0,"strikeDist":-0.1104,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":3.43,"annualReturn":0.7707},{"name":"Rocket Lab Corporation","price":124.77,"iv":0.9869,"ivRank":0.7596,"type":"Put","strike":110.0,"strikeDist":-0.1184,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":3.3,"annualReturn":0.7426},{"name":"Rocket Lab Corporation","price":124.77,"iv":0.9973,"ivRank":0.7596,"type":"Put","strike":109.0,"strikeDist":-0.1264,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":3.0,"annualReturn":0.6751},{"name":"Seagate Technology Holdings","price":795.47,"iv":0.7952,"ivRank":0.9105,"type":"Put","strike":730.0,"strikeDist":-0.0823,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":19.9,"annualReturn":0.7024},{"name":"Seagate Technology Holdings","price":795.47,"iv":0.7901,"ivRank":0.9105,"type":"Put","strike":725.0,"strikeDist":-0.0886,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":19.1,"annualReturn":0.6742},{"name":"Seagate Technology Holdings","price":795.47,"iv":0.8195,"ivRank":0.9105,"type":"Put","strike":720.0,"strikeDist":-0.0949,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":17.1,"annualReturn":0.6036},{"name":"Seagate Technology Holdings","price":795.47,"iv":0.8049,"ivRank":0.9105,"type":"Put","strike":715.0,"strikeDist":-0.1012,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":16.4,"annualReturn":0.5789},{"name":"Seagate Technology Holdings","price":795.47,"iv":0.8275,"ivRank":0.9105,"type":"Put","strike":710.0,"strikeDist":-0.1074,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":14.75,"annualReturn":0.5206},{"name":"Tower Semiconductor","price":273.98,"iv":0.9388,"ivRank":0.8172,"type":"Put","strike":250.0,"strikeDist":-0.0875,"expiry":"2026-05-29","earnings":"2026-08-03","endsBeforeEarnings":"Yes","optionPrice":8.85,"annualReturn":0.9069},{"name":"Tower Semiconductor","price":273.98,"iv":0.9482,"ivRank":0.8172,"type":"Put","strike":247.5,"strikeDist":-0.0966,"expiry":"2026-05-29","earnings":"2026-08-03","endsBeforeEarnings":"Yes","optionPrice":8.2,"annualReturn":0.8403},{"name":"Tower Semiconductor","price":273.98,"iv":0.9363,"ivRank":0.8172,"type":"Put","strike":245.0,"strikeDist":-0.1058,"expiry":"2026-05-29","earnings":"2026-08-03","endsBeforeEarnings":"Yes","optionPrice":7.25,"annualReturn":0.743},{"name":"Tower Semiconductor","price":273.98,"iv":0.9473,"ivRank":0.8172,"type":"Put","strike":240.0,"strikeDist":-0.124,"expiry":"2026-05-29","earnings":"2026-08-03","endsBeforeEarnings":"Yes","optionPrice":6.05,"annualReturn":0.62},{"name":"Western Digital Corp","price":482.02,"iv":0.8373,"ivRank":0.823,"type":"Put","strike":440.0,"strikeDist":-0.0872,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":12.2,"annualReturn":0.7106},{"name":"Western Digital Corp","price":482.02,"iv":0.866,"ivRank":0.823,"type":"Put","strike":437.5,"strikeDist":-0.0924,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":12.63,"annualReturn":0.7354},{"name":"Western Digital Corp","price":482.02,"iv":0.8373,"ivRank":0.823,"type":"Put","strike":435.0,"strikeDist":-0.0975,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":11.28,"annualReturn":0.6568},{"name":"Western Digital Corp","price":482.02,"iv":0.8791,"ivRank":0.823,"type":"Put","strike":430.0,"strikeDist":-0.1079,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":10.48,"annualReturn":0.6102},{"name":"Western Digital Corp","price":482.02,"iv":0.8837,"ivRank":0.823,"type":"Put","strike":427.5,"strikeDist":-0.1131,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":9.78,"annualReturn":0.5694}]},{"id":"outperformance","title":"Outperformance mit attraktivem IV-Rank","shortLabel":"Outperformance","tagline":"Attraktiver IV-Rank","category":"momentum","icon":"📈","accent":"cyan","filters":{"options":["Laufzeit von 14 Tagen","Delta -0,3 bis -0,2","Annualisierte Stillhalterrendite zwischen 20 % und 40 %","IV-Rank > 35 %","Absolute Optionsprämie > 40 $"],"technical":["Preis < 200 $","Outperformance der abgelaufenen Handelswoche gegenüber dem S&P 500 > 4 %"],"fundamental":["Marktkapitalisierung > 5 Milliarden $"]},"stats":{"count":27,"avgReturn":0.2921185185185185,"maxReturn":0.3711,"avgIvRank":0.5543333333333333},"results":[{"name":"Antero Resources Corp","price":38.24,"iv":0.4587,"ivRank":0.4355,"type":"Put","strike":36.0,"strikeDist":-0.0586,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":0.35,"annualReturn":0.257},{"name":"Cardinal Health","price":195.2,"iv":0.2658,"ivRank":0.4263,"type":"Put","strike":190.0,"strikeDist":-0.0266,"expiry":"2026-05-29","earnings":"2026-08-11","endsBeforeEarnings":"Yes","optionPrice":1.75,"annualReturn":0.2517},{"name":"Cf Industries Holdings","price":125.24,"iv":0.463,"ivRank":0.6354,"type":"Put","strike":117.0,"strikeDist":-0.0658,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.3,"annualReturn":0.2914},{"name":"Canadian Natural Resources","price":47.98,"iv":0.3812,"ivRank":0.4132,"type":"Put","strike":45.5,"strikeDist":-0.0517,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":0.6,"annualReturn":0.3511},{"name":"Conocophillips","price":122.41,"iv":0.3414,"ivRank":0.5913,"type":"Put","strike":118.0,"strikeDist":-0.036,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":1.39,"annualReturn":0.3188},{"name":"Conocophillips","price":122.41,"iv":0.3359,"ivRank":0.5913,"type":"Put","strike":117.0,"strikeDist":-0.0442,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":1.05,"annualReturn":0.2408},{"name":"Cisco Systems Inc","price":118.21,"iv":0.3946,"ivRank":0.6342,"type":"Put","strike":113.0,"strikeDist":-0.0441,"expiry":"2026-05-29","earnings":"2026-08-12","endsBeforeEarnings":"Yes","optionPrice":1.42,"annualReturn":0.3361},{"name":"Cisco Systems Inc","price":118.21,"iv":0.3956,"ivRank":0.6342,"type":"Put","strike":112.0,"strikeDist":-0.0525,"expiry":"2026-05-29","earnings":"2026-08-12","endsBeforeEarnings":"Yes","optionPrice":1.14,"annualReturn":0.2708},{"name":"Chevron Corp","price":191.1,"iv":0.3269,"ivRank":0.6971,"type":"Put","strike":185.0,"strikeDist":-0.0319,"expiry":"2026-05-29","earnings":"2026-08-07","endsBeforeEarnings":"Yes","optionPrice":2.2,"annualReturn":0.3232},{"name":"Chevron Corp","price":191.1,"iv":0.3223,"ivRank":0.6971,"type":"Put","strike":182.5,"strikeDist":-0.045,"expiry":"2026-05-29","earnings":"2026-08-07","endsBeforeEarnings":"Yes","optionPrice":1.47,"annualReturn":0.216},{"name":"Dow Inc","price":38.75,"iv":0.4914,"ivRank":0.3527,"type":"Put","strike":36.0,"strikeDist":-0.071,"expiry":"2026-05-29","earnings":"2026-07-23","endsBeforeEarnings":"Yes","optionPrice":0.48,"annualReturn":0.3442},{"name":"Devon Energy Corp","price":49.49,"iv":0.3816,"ivRank":0.6759,"type":"Put","strike":47.5,"strikeDist":-0.0402,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":0.58,"annualReturn":0.329},{"name":"Devon Energy Corp","price":49.49,"iv":0.3939,"ivRank":0.6759,"type":"Put","strike":47.0,"strikeDist":-0.0503,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":0.46,"annualReturn":0.2581},{"name":"Devon Energy Corp","price":49.49,"iv":0.4491,"ivRank":0.6759,"type":"Put","strike":46.5,"strikeDist":-0.0604,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":0.46,"annualReturn":0.261},{"name":"Ebay Inc","price":116.13,"iv":0.3687,"ivRank":0.5037,"type":"Put","strike":112.0,"strikeDist":-0.0356,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":1.54,"annualReturn":0.3711},{"name":"Ebay Inc","price":116.13,"iv":0.3668,"ivRank":0.5037,"type":"Put","strike":111.0,"strikeDist":-0.0442,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":1.08,"annualReturn":0.2611},{"name":"Eog Resources","price":140.26,"iv":0.3179,"ivRank":0.5869,"type":"Put","strike":135.0,"strikeDist":-0.0375,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":1.3,"annualReturn":0.2602},{"name":"Fortinet Inc","price":122.78,"iv":0.4212,"ivRank":0.4058,"type":"Put","strike":117.0,"strikeDist":-0.0471,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.29,"annualReturn":0.2938},{"name":"Fortinet Inc","price":122.78,"iv":0.4113,"ivRank":0.4058,"type":"Put","strike":116.0,"strikeDist":-0.0552,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.07,"annualReturn":0.2447},{"name":"Halliburton Company","price":41.76,"iv":0.3815,"ivRank":0.3617,"type":"Put","strike":40.0,"strikeDist":-0.0421,"expiry":"2026-05-29","earnings":"2026-07-28","endsBeforeEarnings":"Yes","optionPrice":0.49,"annualReturn":0.3294},{"name":"Hewlett Packard Enterprise","price":33.1,"iv":0.4892,"ivRank":0.8818,"type":"Put","strike":31.0,"strikeDist":-0.0634,"expiry":"2026-05-29","earnings":"2026-06-01","endsBeforeEarnings":"Yes","optionPrice":0.42,"annualReturn":0.3563},{"name":"Nutrien Ltd","price":71.56,"iv":0.3409,"ivRank":0.4797,"type":"Put","strike":69.0,"strikeDist":-0.0358,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":0.8,"annualReturn":0.3139},{"name":"Nutrien Ltd","price":71.56,"iv":0.3533,"ivRank":0.4797,"type":"Put","strike":68.0,"strikeDist":-0.0497,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":0.65,"annualReturn":0.255},{"name":"On Holding Ag Cl A","price":37.26,"iv":0.53,"ivRank":0.4167,"type":"Put","strike":34.5,"strikeDist":-0.0741,"expiry":"2026-05-29","earnings":"2026-08-11","endsBeforeEarnings":"Yes","optionPrice":0.45,"annualReturn":0.3353},{"name":"Occidental Petroleum","price":59.62,"iv":0.3759,"ivRank":0.6576,"type":"Put","strike":57.0,"strikeDist":-0.0439,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":0.63,"annualReturn":0.2967},{"name":"Philip Morris International","price":189.61,"iv":0.2437,"ivRank":0.3966,"type":"Put","strike":185.0,"strikeDist":-0.0243,"expiry":"2026-05-29","earnings":"2026-07-28","endsBeforeEarnings":"Yes","optionPrice":1.6,"annualReturn":0.2369},{"name":"Exxon Mobil Corp","price":157.92,"iv":0.3391,"ivRank":0.7513,"type":"Put","strike":152.5,"strikeDist":-0.0343,"expiry":"2026-05-29","earnings":"2026-08-07","endsBeforeEarnings":"Yes","optionPrice":1.6,"annualReturn":0.2836}]},{"id":"naked-call","title":"Naked Call mit überkauften Underlyings","shortLabel":"Naked Call","tagline":"Überkaufte Underlyings","category":"mean-reversion","icon":"🎯","accent":"rose","filters":{"options":["Laufzeit von 14 Tagen","Delta -0,25 bis -0,2","nur Call-Kontrakte","IV-Rank > 30 %","Optionsauslauf vor Earnings","Abstand zum Geld > 5 %"],"technical":["RSI > 70"],"fundamental":["Marktkapitalisierung > 20 Milliarden $"]},"stats":{"count":27,"avgReturn":0.2921185185185185,"maxReturn":0.3711,"avgIvRank":0.5543333333333333},"results":[{"name":"Antero Resources Corp","price":38.24,"iv":0.4587,"ivRank":0.4355,"type":"Put","strike":36.0,"strikeDist":-0.0586,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":0.35,"annualReturn":0.257},{"name":"Cardinal Health","price":195.2,"iv":0.2658,"ivRank":0.4263,"type":"Put","strike":190.0,"strikeDist":-0.0266,"expiry":"2026-05-29","earnings":"2026-08-11","endsBeforeEarnings":"Yes","optionPrice":1.75,"annualReturn":0.2517},{"name":"Cf Industries Holdings","price":125.24,"iv":0.463,"ivRank":0.6354,"type":"Put","strike":117.0,"strikeDist":-0.0658,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.3,"annualReturn":0.2914},{"name":"Canadian Natural Resources","price":47.98,"iv":0.3812,"ivRank":0.4132,"type":"Put","strike":45.5,"strikeDist":-0.0517,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":0.6,"annualReturn":0.3511},{"name":"Conocophillips","price":122.41,"iv":0.3414,"ivRank":0.5913,"type":"Put","strike":118.0,"strikeDist":-0.036,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":1.39,"annualReturn":0.3188},{"name":"Conocophillips","price":122.41,"iv":0.3359,"ivRank":0.5913,"type":"Put","strike":117.0,"strikeDist":-0.0442,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":1.05,"annualReturn":0.2408},{"name":"Cisco Systems Inc","price":118.21,"iv":0.3946,"ivRank":0.6342,"type":"Put","strike":113.0,"strikeDist":-0.0441,"expiry":"2026-05-29","earnings":"2026-08-12","endsBeforeEarnings":"Yes","optionPrice":1.42,"annualReturn":0.3361},{"name":"Cisco Systems Inc","price":118.21,"iv":0.3956,"ivRank":0.6342,"type":"Put","strike":112.0,"strikeDist":-0.0525,"expiry":"2026-05-29","earnings":"2026-08-12","endsBeforeEarnings":"Yes","optionPrice":1.14,"annualReturn":0.2708},{"name":"Chevron Corp","price":191.1,"iv":0.3269,"ivRank":0.6971,"type":"Put","strike":185.0,"strikeDist":-0.0319,"expiry":"2026-05-29","earnings":"2026-08-07","endsBeforeEarnings":"Yes","optionPrice":2.2,"annualReturn":0.3232},{"name":"Chevron Corp","price":191.1,"iv":0.3223,"ivRank":0.6971,"type":"Put","strike":182.5,"strikeDist":-0.045,"expiry":"2026-05-29","earnings":"2026-08-07","endsBeforeEarnings":"Yes","optionPrice":1.47,"annualReturn":0.216},{"name":"Dow Inc","price":38.75,"iv":0.4914,"ivRank":0.3527,"type":"Put","strike":36.0,"strikeDist":-0.071,"expiry":"2026-05-29","earnings":"2026-07-23","endsBeforeEarnings":"Yes","optionPrice":0.48,"annualReturn":0.3442},{"name":"Devon Energy Corp","price":49.49,"iv":0.3816,"ivRank":0.6759,"type":"Put","strike":47.5,"strikeDist":-0.0402,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":0.58,"annualReturn":0.329},{"name":"Devon Energy Corp","price":49.49,"iv":0.3939,"ivRank":0.6759,"type":"Put","strike":47.0,"strikeDist":-0.0503,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":0.46,"annualReturn":0.2581},{"name":"Devon Energy Corp","price":49.49,"iv":0.4491,"ivRank":0.6759,"type":"Put","strike":46.5,"strikeDist":-0.0604,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":0.46,"annualReturn":0.261},{"name":"Ebay Inc","price":116.13,"iv":0.3687,"ivRank":0.5037,"type":"Put","strike":112.0,"strikeDist":-0.0356,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":1.54,"annualReturn":0.3711},{"name":"Ebay Inc","price":116.13,"iv":0.3668,"ivRank":0.5037,"type":"Put","strike":111.0,"strikeDist":-0.0442,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":1.08,"annualReturn":0.2611},{"name":"Eog Resources","price":140.26,"iv":0.3179,"ivRank":0.5869,"type":"Put","strike":135.0,"strikeDist":-0.0375,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":1.3,"annualReturn":0.2602},{"name":"Fortinet Inc","price":122.78,"iv":0.4212,"ivRank":0.4058,"type":"Put","strike":117.0,"strikeDist":-0.0471,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.29,"annualReturn":0.2938},{"name":"Fortinet Inc","price":122.78,"iv":0.4113,"ivRank":0.4058,"type":"Put","strike":116.0,"strikeDist":-0.0552,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.07,"annualReturn":0.2447},{"name":"Halliburton Company","price":41.76,"iv":0.3815,"ivRank":0.3617,"type":"Put","strike":40.0,"strikeDist":-0.0421,"expiry":"2026-05-29","earnings":"2026-07-28","endsBeforeEarnings":"Yes","optionPrice":0.49,"annualReturn":0.3294},{"name":"Hewlett Packard Enterprise","price":33.1,"iv":0.4892,"ivRank":0.8818,"type":"Put","strike":31.0,"strikeDist":-0.0634,"expiry":"2026-05-29","earnings":"2026-06-01","endsBeforeEarnings":"Yes","optionPrice":0.42,"annualReturn":0.3563},{"name":"Nutrien Ltd","price":71.56,"iv":0.3409,"ivRank":0.4797,"type":"Put","strike":69.0,"strikeDist":-0.0358,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":0.8,"annualReturn":0.3139},{"name":"Nutrien Ltd","price":71.56,"iv":0.3533,"ivRank":0.4797,"type":"Put","strike":68.0,"strikeDist":-0.0497,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":0.65,"annualReturn":0.255},{"name":"On Holding Ag Cl A","price":37.26,"iv":0.53,"ivRank":0.4167,"type":"Put","strike":34.5,"strikeDist":-0.0741,"expiry":"2026-05-29","earnings":"2026-08-11","endsBeforeEarnings":"Yes","optionPrice":0.45,"annualReturn":0.3353},{"name":"Occidental Petroleum","price":59.62,"iv":0.3759,"ivRank":0.6576,"type":"Put","strike":57.0,"strikeDist":-0.0439,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":0.63,"annualReturn":0.2967},{"name":"Philip Morris International","price":189.61,"iv":0.2437,"ivRank":0.3966,"type":"Put","strike":185.0,"strikeDist":-0.0243,"expiry":"2026-05-29","earnings":"2026-07-28","endsBeforeEarnings":"Yes","optionPrice":1.6,"annualReturn":0.2369},{"name":"Exxon Mobil Corp","price":157.92,"iv":0.3391,"ivRank":0.7513,"type":"Put","strike":152.5,"strikeDist":-0.0343,"expiry":"2026-05-29","earnings":"2026-08-07","endsBeforeEarnings":"Yes","optionPrice":1.6,"annualReturn":0.2836}]},{"id":"52w-hoch","title":"52-Wochenhoch ohne Earnings-Risiko","shortLabel":"52W-Hoch","tagline":"Momentum ohne Earnings-Risiko","category":"momentum","icon":"🚀","accent":"amber","filters":{"options":["Laufzeit zwischen 6 und 14 Tagen","Delta -0,3 bis -0,2","Optionsauslauf vor Earnings","Annualisierte Stillhalterrendite > 20 %"],"technical":["Maximal 2 % Abstand vom Jahreshoch  (Je nach Marktphase werden wir diesen Parameter ggf. etwas anpassen, um nicht zu viele bzw. zu wenig Treffer bei diesem Screening zu erhalten)"],"fundamental":["Marktkapitalisierung > 10 Milliarden $","Beschränkung Preis des Underlyings bis 200 $"]},"stats":{"count":16,"avgReturn":0.352,"maxReturn":0.5984,"avgIvRank":0.38595625},"results":[{"name":"Cisco Systems Inc","price":118.21,"iv":0.3963,"ivRank":0.6342,"type":"Put","strike":114.0,"strikeDist":-0.0356,"expiry":"2026-05-29","earnings":"2026-08-12","endsBeforeEarnings":"Yes","optionPrice":1.71,"annualReturn":0.4062},{"name":"Cisco Systems Inc","price":118.21,"iv":0.3946,"ivRank":0.6342,"type":"Put","strike":113.0,"strikeDist":-0.0441,"expiry":"2026-05-29","earnings":"2026-08-12","endsBeforeEarnings":"Yes","optionPrice":1.42,"annualReturn":0.3361},{"name":"Cisco Systems Inc","price":118.21,"iv":0.3956,"ivRank":0.6342,"type":"Put","strike":112.0,"strikeDist":-0.0525,"expiry":"2026-05-29","earnings":"2026-08-12","endsBeforeEarnings":"Yes","optionPrice":1.14,"annualReturn":0.2708},{"name":"Ebay Inc","price":116.13,"iv":0.3687,"ivRank":0.5037,"type":"Put","strike":112.0,"strikeDist":-0.0356,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":1.54,"annualReturn":0.3711},{"name":"Ebay Inc","price":116.13,"iv":0.3668,"ivRank":0.5037,"type":"Put","strike":111.0,"strikeDist":-0.0442,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":1.08,"annualReturn":0.2611},{"name":"Fortinet Inc","price":122.78,"iv":0.4212,"ivRank":0.4058,"type":"Put","strike":117.0,"strikeDist":-0.0471,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.29,"annualReturn":0.2938},{"name":"Fortinet Inc","price":122.78,"iv":0.4113,"ivRank":0.4058,"type":"Put","strike":116.0,"strikeDist":-0.0552,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.07,"annualReturn":0.2447},{"name":"Halliburton Company","price":41.76,"iv":0.3815,"ivRank":0.3617,"type":"Put","strike":40.0,"strikeDist":-0.0421,"expiry":"2026-05-29","earnings":"2026-07-28","endsBeforeEarnings":"Yes","optionPrice":0.49,"annualReturn":0.3294},{"name":"Interactive Brokers","price":87.0,"iv":0.4026,"ivRank":0.3545,"type":"Put","strike":83.0,"strikeDist":-0.046,"expiry":"2026-05-29","earnings":"2026-07-16","endsBeforeEarnings":"Yes","optionPrice":1.15,"annualReturn":0.3711},{"name":"Interactive Brokers","price":87.0,"iv":0.4026,"ivRank":0.3545,"type":"Put","strike":82.0,"strikeDist":-0.0575,"expiry":"2026-05-29","earnings":"2026-07-16","endsBeforeEarnings":"Yes","optionPrice":0.88,"annualReturn":0.2824},{"name":"Philip Morris International","price":189.61,"iv":0.2437,"ivRank":0.3966,"type":"Put","strike":185.0,"strikeDist":-0.0243,"expiry":"2026-05-29","earnings":"2026-07-28","endsBeforeEarnings":"Yes","optionPrice":1.6,"annualReturn":0.2369},{"name":"Echostar Corp","price":137.23,"iv":0.6999,"ivRank":0.25,"type":"Put","strike":126.0,"strikeDist":-0.0818,"expiry":"2026-05-29","earnings":"2026-08-07","endsBeforeEarnings":"Yes","optionPrice":2.7,"annualReturn":0.5524},{"name":"Echostar Corp","price":137.23,"iv":0.6943,"ivRank":0.25,"type":"Put","strike":125.0,"strikeDist":-0.0891,"expiry":"2026-05-29","earnings":"2026-08-07","endsBeforeEarnings":"Yes","optionPrice":2.93,"annualReturn":0.5984},{"name":"Echostar Corp","price":137.23,"iv":0.7225,"ivRank":0.25,"type":"Put","strike":124.0,"strikeDist":-0.0964,"expiry":"2026-05-29","earnings":"2026-08-07","endsBeforeEarnings":"Yes","optionPrice":2.8,"annualReturn":0.5729},{"name":"Starbucks Corp","price":106.82,"iv":0.2811,"ivRank":0.1182,"type":"Put","strike":104.0,"strikeDist":-0.0264,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":1.09,"annualReturn":0.2852},{"name":"Starbucks Corp","price":106.82,"iv":0.2887,"ivRank":0.1182,"type":"Put","strike":103.0,"strikeDist":-0.0358,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":0.84,"annualReturn":0.2195}]},{"id":"etfs","title":"ETFs mit hohen Renditen","shortLabel":"ETFs","tagline":"Hohe Renditen, breite Streuung","category":"stillhalter","icon":"💎","accent":"violet","filters":{"options":["Laufzeit zwischen 14 Tage","Delta -0,3 bis -0,2","Annualisierte Stillhalterrendite zwischen 20 % und 40 %","Abstand zum Geld mind. 3,5 %","IV-Rank > 50 %"],"technical":["Preis > 30 $"],"fundamental":["keine"]},"stats":{"count":20,"avgReturn":0.312155,"maxReturn":0.3936,"avgIvRank":0.65499},"results":[{"name":"Emrg Mkts Ishares MSCI ETF","price":65.07,"iv":0.3327,"ivRank":0.5882,"type":"Put","strike":62.5,"strikeDist":-0.0395,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":0.62,"annualReturn":0.2675},{"name":"Vaneck Gold Miners ETF","price":87.35,"iv":0.4503,"ivRank":0.5815,"type":"Put","strike":83.0,"strikeDist":-0.0498,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":1.12,"annualReturn":0.36},{"name":"Vaneck Gold Miners ETF","price":87.35,"iv":0.4524,"ivRank":0.5815,"type":"Put","strike":82.0,"strikeDist":-0.0612,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":0.92,"annualReturn":0.2941},{"name":"Vaneck Junior Gold Miners ETF","price":116.37,"iv":0.5073,"ivRank":0.5535,"type":"Put","strike":109.0,"strikeDist":-0.0633,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":1.5,"annualReturn":0.3607},{"name":"North American Tech-Software Ishares ETF","price":91.78,"iv":0.3489,"ivRank":0.6165,"type":"Put","strike":88.5,"strikeDist":-0.0357,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":1.2,"annualReturn":0.3671},{"name":"North American Tech-Software Ishares ETF","price":91.78,"iv":0.3562,"ivRank":0.6165,"type":"Put","strike":88.0,"strikeDist":-0.0412,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":1.05,"annualReturn":0.3212},{"name":"North American Tech-Software Ishares ETF","price":91.78,"iv":0.3653,"ivRank":0.6165,"type":"Put","strike":87.0,"strikeDist":-0.0521,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":0.75,"annualReturn":0.2294},{"name":"Invesco QQQ Trust Series 1","price":708.93,"iv":0.2762,"ivRank":0.5545,"type":"Put","strike":684.0,"strikeDist":-0.0352,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":5.12,"annualReturn":0.2028},{"name":"Vaneck Semiconductor ETF","price":556.34,"iv":0.5628,"ivRank":0.8793,"type":"Put","strike":515.0,"strikeDist":-0.0743,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":7.6,"annualReturn":0.3836},{"name":"Semiconductor Ishares ETF","price":508.52,"iv":0.5746,"ivRank":0.9718,"type":"Put","strike":470.0,"strikeDist":-0.0757,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":6.4,"annualReturn":0.3534},{"name":"Semiconductor Ishares ETF","price":508.52,"iv":0.5595,"ivRank":0.9718,"type":"Put","strike":472.5,"strikeDist":-0.0708,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":6.9,"annualReturn":0.381},{"name":"GX Uranium ETF","price":49.93,"iv":0.5151,"ivRank":0.638,"type":"Put","strike":47.0,"strikeDist":-0.0587,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":0.7,"annualReturn":0.3936},{"name":"GX Uranium ETF","price":49.93,"iv":0.5261,"ivRank":0.638,"type":"Put","strike":46.5,"strikeDist":-0.0687,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":0.68,"annualReturn":0.3796},{"name":"S&P Homebuilders SPDR","price":96.32,"iv":0.3316,"ivRank":0.6296,"type":"Put","strike":92.0,"strikeDist":-0.0449,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":0.89,"annualReturn":0.258},{"name":"S&P 500 Technology Sector SPDR","price":176.26,"iv":0.3336,"ivRank":0.6601,"type":"Put","strike":170.0,"strikeDist":-0.0355,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":2.0,"annualReturn":0.3178},{"name":"S&P 500 Technology Sector SPDR","price":176.26,"iv":0.3249,"ivRank":0.6601,"type":"Put","strike":169.0,"strikeDist":-0.0412,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":1.46,"annualReturn":0.2334},{"name":"S&P Oil & Gas Expl & Prod SPDR","price":174.13,"iv":0.3744,"ivRank":0.5856,"type":"Put","strike":167.5,"strikeDist":-0.0381,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":1.97,"annualReturn":0.3176},{"name":"S&P Oil & Gas Expl & Prod SPDR","price":174.13,"iv":0.3777,"ivRank":0.5856,"type":"Put","strike":167.0,"strikeDist":-0.0409,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":1.87,"annualReturn":0.3007},{"name":"S&P Oil & Gas Expl & Prod SPDR","price":174.13,"iv":0.3577,"ivRank":0.5856,"type":"Put","strike":166.0,"strikeDist":-0.0467,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":1.71,"annualReturn":0.2765},{"name":"S&P Oil & Gas Expl & Prod SPDR","price":174.13,"iv":0.3654,"ivRank":0.5856,"type":"Put","strike":165.0,"strikeDist":-0.0524,"expiry":"2026-05-29","earnings":"N/A","endsBeforeEarnings":"N/A","optionPrice":1.52,"annualReturn":0.2451}]},{"id":"dauerlaeufer","title":"Dauerläufer mit Rücksetzer","shortLabel":"Dauerläufer","tagline":"Überverkauft & über GD200","category":"mean-reversion","icon":"🪂","accent":"sky","filters":{"options":["Laufzeit zwischen 10 und 14 Tagen","Delta -0,3 bis -0,2","Annualisierte Stillhalterrendite > 20 %"],"technical":["RSI (14 Tage) < 35","Aktienkurs des Underlyings über dem GD 200"],"fundamental":["keine"]},"stats":{"count":1,"avgReturn":0.3705,"maxReturn":0.3705,"avgIvRank":0.2894},"results":[{"name":"Align Technology","price":157.25,"iv":0.426,"ivRank":0.2894,"type":"Put","strike":150.0,"strikeDist":-0.0461,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":2.08,"annualReturn":0.3705}]},{"id":"aktien-unter-40","title":"Aktien unter $40","shortLabel":"Aktien < $40","tagline":"Kleines Kapital, hohe Renditen","category":"stillhalter","icon":"💰","accent":"teal","filters":{"options":[],"technical":[],"fundamental":[]},"stats":{"count":33,"avgReturn":1.0590424242424241,"maxReturn":2.4008,"avgIvRank":0.3211090909090909},"results":[{"name":"Celsius Holdings Inc","price":30.16,"iv":0.5523,"ivRank":0.4173,"type":"Put","strike":30.0,"strikeDist":-0.0053,"expiry":"2026-06-05","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":1.45,"annualReturn":0.8744},{"name":"Celsius Holdings Inc","price":30.16,"iv":0.5369,"ivRank":0.4173,"type":"Put","strike":30.0,"strikeDist":-0.0053,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":1.13,"annualReturn":1.052},{"name":"Celsius Holdings Inc","price":30.16,"iv":0.556,"ivRank":0.4173,"type":"Put","strike":30.0,"strikeDist":-0.0053,"expiry":"2026-05-22","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":0.79,"annualReturn":1.6035},{"name":"Coupang Inc Cl A","price":16.12,"iv":0.4392,"ivRank":0.4911,"type":"Put","strike":16.0,"strikeDist":-0.0074,"expiry":"2026-05-22","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":0.32,"annualReturn":1.2265},{"name":"Coupang Inc Cl A","price":16.12,"iv":0.4481,"ivRank":0.4911,"type":"Put","strike":16.0,"strikeDist":-0.0074,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":0.48,"annualReturn":0.8273},{"name":"Coupang Inc Cl A","price":16.12,"iv":0.4483,"ivRank":0.4911,"type":"Put","strike":16.0,"strikeDist":-0.0074,"expiry":"2026-06-05","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":0.61,"annualReturn":0.6906},{"name":"Hims & Hers Health Inc","price":25.05,"iv":0.7515,"ivRank":0.2525,"type":"Put","strike":25.0,"strikeDist":-0.002,"expiry":"2026-05-29","earnings":"2026-08-03","endsBeforeEarnings":"Yes","optionPrice":1.38,"annualReturn":1.5411},{"name":"Hims & Hers Health Inc","price":25.05,"iv":0.7672,"ivRank":0.2525,"type":"Put","strike":25.0,"strikeDist":-0.002,"expiry":"2026-05-22","earnings":"2026-08-03","endsBeforeEarnings":"Yes","optionPrice":0.98,"annualReturn":2.3678},{"name":"Hims & Hers Health Inc","price":25.05,"iv":0.8221,"ivRank":0.2525,"type":"Put","strike":25.0,"strikeDist":-0.002,"expiry":"2026-06-05","earnings":"2026-08-03","endsBeforeEarnings":"Yes","optionPrice":1.86,"annualReturn":1.3551},{"name":"Jd.com Inc ADR","price":32.01,"iv":0.3634,"ivRank":0.362,"type":"Put","strike":32.0,"strikeDist":-0.0003,"expiry":"2026-05-22","earnings":"2026-08-13","endsBeforeEarnings":"Yes","optionPrice":0.6,"annualReturn":1.1403},{"name":"Jd.com Inc ADR","price":32.01,"iv":0.3174,"ivRank":0.362,"type":"Put","strike":32.0,"strikeDist":-0.0003,"expiry":"2026-06-05","earnings":"2026-08-13","endsBeforeEarnings":"Yes","optionPrice":1.01,"annualReturn":0.5758},{"name":"Jd.com Inc ADR","price":32.01,"iv":0.341,"ivRank":0.362,"type":"Put","strike":32.0,"strikeDist":-0.0003,"expiry":"2026-05-29","earnings":"2026-08-13","endsBeforeEarnings":"Yes","optionPrice":0.84,"annualReturn":0.7368},{"name":"Pfizer Inc","price":25.33,"iv":0.2007,"ivRank":0.2728,"type":"Put","strike":25.0,"strikeDist":-0.013,"expiry":"2026-06-05","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":0.33,"annualReturn":0.2414},{"name":"Pfizer Inc","price":25.33,"iv":0.2268,"ivRank":0.2728,"type":"Put","strike":25.0,"strikeDist":-0.013,"expiry":"2026-05-22","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":0.16,"annualReturn":0.3843},{"name":"Pfizer Inc","price":25.33,"iv":0.2079,"ivRank":0.2728,"type":"Put","strike":25.0,"strikeDist":-0.013,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":0.26,"annualReturn":0.2827},{"name":"Super Micro Computer","price":31.04,"iv":0.8187,"ivRank":0.3756,"type":"Put","strike":31.0,"strikeDist":-0.0013,"expiry":"2026-05-22","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":1.23,"annualReturn":2.4008},{"name":"Super Micro Computer","price":31.04,"iv":0.6594,"ivRank":0.3756,"type":"Put","strike":31.0,"strikeDist":-0.0013,"expiry":"2026-06-05","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":1.95,"annualReturn":1.1436},{"name":"Super Micro Computer","price":31.04,"iv":0.7149,"ivRank":0.3756,"type":"Put","strike":31.0,"strikeDist":-0.0013,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":1.62,"annualReturn":1.4608},{"name":"Snap Inc","price":5.53,"iv":0.5973,"ivRank":0.276,"type":"Put","strike":5.5,"strikeDist":-0.0054,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":0.23,"annualReturn":1.1678},{"name":"Snap Inc","price":5.53,"iv":0.5823,"ivRank":0.276,"type":"Put","strike":5.5,"strikeDist":-0.0054,"expiry":"2026-06-05","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":0.28,"annualReturn":0.9241},{"name":"Snap Inc","price":5.53,"iv":0.6242,"ivRank":0.276,"type":"Put","strike":5.5,"strikeDist":-0.0054,"expiry":"2026-05-22","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":0.17,"annualReturn":1.8701},{"name":"AT&T Inc","price":24.03,"iv":0.2469,"ivRank":0.3747,"type":"Put","strike":24.0,"strikeDist":-0.0012,"expiry":"2026-05-22","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":0.28,"annualReturn":0.7088},{"name":"AT&T Inc","price":24.03,"iv":0.2097,"ivRank":0.3747,"type":"Put","strike":24.0,"strikeDist":-0.0012,"expiry":"2026-06-05","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":0.38,"annualReturn":0.2886},{"name":"AT&T Inc","price":24.03,"iv":0.2,"ivRank":0.3747,"type":"Put","strike":24.0,"strikeDist":-0.0012,"expiry":"2026-05-29","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":0.43,"annualReturn":0.5024},{"name":"Trade Desk Inc","price":21.15,"iv":0.6037,"ivRank":0.3778,"type":"Put","strike":21.0,"strikeDist":-0.0071,"expiry":"2026-06-05","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":1.1,"annualReturn":0.9449},{"name":"Trade Desk Inc","price":21.15,"iv":0.5832,"ivRank":0.3778,"type":"Put","strike":21.0,"strikeDist":-0.0071,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":0.84,"annualReturn":1.1151},{"name":"Trade Desk Inc","price":21.15,"iv":0.6289,"ivRank":0.3778,"type":"Put","strike":21.0,"strikeDist":-0.0071,"expiry":"2026-05-22","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":0.6,"annualReturn":1.7114},{"name":"Unity Software Inc","price":27.16,"iv":0.6818,"ivRank":0.2618,"type":"Put","strike":27.0,"strikeDist":-0.0059,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.3,"annualReturn":1.3387},{"name":"Unity Software Inc","price":27.16,"iv":0.6662,"ivRank":0.2618,"type":"Put","strike":27.0,"strikeDist":-0.0059,"expiry":"2026-06-05","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.58,"annualReturn":1.0617},{"name":"Unity Software Inc","price":27.16,"iv":0.7404,"ivRank":0.2618,"type":"Put","strike":27.0,"strikeDist":-0.0059,"expiry":"2026-05-22","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":0.94,"annualReturn":2.1054},{"name":"Discovery Inc Series A","price":26.98,"iv":0.1241,"ivRank":0.0706,"type":"Put","strike":27.0,"strikeDist":0.0007,"expiry":"2026-06-05","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":0.6,"annualReturn":0.3923},{"name":"Discovery Inc Series A","price":26.98,"iv":0.0992,"ivRank":0.0706,"type":"Put","strike":27.0,"strikeDist":0.0007,"expiry":"2026-05-22","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":0.15,"annualReturn":0.2931},{"name":"Discovery Inc Series A","price":26.98,"iv":0.1107,"ivRank":0.0706,"type":"Put","strike":27.0,"strikeDist":0.0007,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":0.62,"annualReturn":0.6192}]},{"id":"wertloser-verfall","title":"Hohe POP, wertloser Verfall","shortLabel":"Wertloser Verfall","tagline":"Hohe POP, kleines Delta","category":"stillhalter","icon":"⚓","accent":"fuchsia","filters":{"options":["Laufzeit von 14 Tagen","Delta -0,2 bis -0,1","Annualisierte Stillhalterrendite zwischen 20 % und 40 %","Absolute Optionsprämie > 40 $","Absolute Differenz zwischen Bid und Ask < 5 $"],"technical":["Underlying notiert über der 200-Tagelinie"],"fundamental":[]},"stats":{"count":1,"avgReturn":0.0,"maxReturn":0.0,"avgIvRank":0.0},"results":[{"name":"keine Treffer","price":0.0,"iv":0.0,"ivRank":0.0,"type":"","strike":0.0,"strikeDist":0.0,"expiry":null,"earnings":null,"endsBeforeEarnings":"","optionPrice":0.0,"annualReturn":0.0}]},{"id":"stillhalter-universum","title":"Stillhalter-Universum","shortLabel":"Stillhalter","tagline":"Universum mit hohen Renditen","category":"stillhalter","icon":"🏛","accent":"indigo","filters":{"options":[],"technical":[],"fundamental":[]},"stats":{"count":172,"avgReturn":1.0805046511627907,"maxReturn":3.2181,"avgIvRank":0.4820895348837209},"results":[{"name":"Apple Inc","price":300.23,"iv":0.2465,"ivRank":0.3819,"type":"Put","strike":300.0,"strikeDist":-0.0008,"expiry":"2026-05-22","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":3.6,"annualReturn":0.7294},{"name":"Apple Inc","price":300.23,"iv":0.2165,"ivRank":0.3819,"type":"Put","strike":300.0,"strikeDist":-0.0008,"expiry":"2026-05-26","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":4.1,"annualReturn":0.4985},{"name":"Apple Inc","price":300.23,"iv":0.2308,"ivRank":0.3819,"type":"Put","strike":300.0,"strikeDist":-0.0008,"expiry":"2026-06-05","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":6.13,"annualReturn":0.3723},{"name":"Apple Inc","price":300.23,"iv":0.2265,"ivRank":0.3819,"type":"Put","strike":300.0,"strikeDist":-0.0008,"expiry":"2026-05-29","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":4.98,"annualReturn":0.4653},{"name":"Apple Inc","price":300.23,"iv":0.2522,"ivRank":0.3819,"type":"Put","strike":300.0,"strikeDist":-0.0008,"expiry":"2026-05-20","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":2.97,"annualReturn":0.9012},{"name":"Apple Inc","price":300.23,"iv":0.2282,"ivRank":0.3819,"type":"Put","strike":300.0,"strikeDist":-0.0008,"expiry":"2026-05-27","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":4.5,"annualReturn":0.4973},{"name":"Airbnb Inc Cl A","price":132.85,"iv":0.3293,"ivRank":0.3788,"type":"Put","strike":132.0,"strikeDist":-0.0064,"expiry":"2026-05-22","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.66,"annualReturn":0.7601},{"name":"Airbnb Inc Cl A","price":132.85,"iv":0.3374,"ivRank":0.3788,"type":"Put","strike":132.0,"strikeDist":-0.0064,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":2.89,"annualReturn":0.6097},{"name":"Adobe Systems Inc","price":247.6,"iv":0.4628,"ivRank":0.8557,"type":"Put","strike":247.5,"strikeDist":-0.0004,"expiry":"2026-05-29","earnings":"2026-06-11","endsBeforeEarnings":"Yes","optionPrice":8.08,"annualReturn":0.9157},{"name":"Adobe Systems Inc","price":247.6,"iv":0.5195,"ivRank":0.8557,"type":"Put","strike":247.5,"strikeDist":-0.0004,"expiry":"2026-05-22","earnings":"2026-06-11","endsBeforeEarnings":"Yes","optionPrice":6.0,"annualReturn":1.4742},{"name":"Adv Micro Devices","price":424.1,"iv":0.6715,"ivRank":0.7756,"type":"Put","strike":422.5,"strikeDist":-0.0038,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":20.35,"annualReturn":1.3472},{"name":"Adv Micro Devices","price":424.1,"iv":0.7717,"ivRank":0.7756,"type":"Put","strike":422.5,"strikeDist":-0.0038,"expiry":"2026-05-22","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":15.43,"annualReturn":2.2126},{"name":"Amazon.com Inc","price":264.14,"iv":0.2896,"ivRank":0.2405,"type":"Put","strike":262.5,"strikeDist":-0.0062,"expiry":"2026-05-29","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":4.83,"annualReturn":0.5129},{"name":"Amazon.com Inc","price":264.14,"iv":0.3052,"ivRank":0.2405,"type":"Put","strike":262.5,"strikeDist":-0.0062,"expiry":"2026-05-20","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":2.56,"annualReturn":0.8844},{"name":"Amazon.com Inc","price":264.14,"iv":0.3172,"ivRank":0.2405,"type":"Put","strike":262.5,"strikeDist":-0.0062,"expiry":"2026-05-22","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":3.43,"annualReturn":0.7888},{"name":"Amazon.com Inc","price":264.14,"iv":0.2778,"ivRank":0.2405,"type":"Put","strike":262.5,"strikeDist":-0.0062,"expiry":"2026-05-26","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":3.95,"annualReturn":0.5458},{"name":"Amazon.com Inc","price":264.14,"iv":0.2893,"ivRank":0.2405,"type":"Put","strike":262.5,"strikeDist":-0.0062,"expiry":"2026-05-27","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":4.3,"annualReturn":0.5402},{"name":"Arm Holdings Plc ADR","price":209.16,"iv":0.8111,"ivRank":0.5501,"type":"Put","strike":207.5,"strikeDist":-0.0079,"expiry":"2026-05-22","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":7.68,"annualReturn":2.2322},{"name":"Arm Holdings Plc ADR","price":209.16,"iv":0.7165,"ivRank":0.5501,"type":"Put","strike":207.5,"strikeDist":-0.0079,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":10.3,"annualReturn":1.3826},{"name":"Alibaba Group Holding ADR","price":132.59,"iv":0.4515,"ivRank":0.4581,"type":"Put","strike":132.0,"strikeDist":-0.0044,"expiry":"2026-05-22","earnings":"2026-09-04","endsBeforeEarnings":"Yes","optionPrice":2.76,"annualReturn":1.2663},{"name":"Alibaba Group Holding ADR","price":132.59,"iv":0.4075,"ivRank":0.4581,"type":"Put","strike":132.0,"strikeDist":-0.0044,"expiry":"2026-05-29","earnings":"2026-09-04","endsBeforeEarnings":"Yes","optionPrice":3.8,"annualReturn":0.8047},{"name":"Alibaba Group Holding ADR","price":132.59,"iv":0.4009,"ivRank":0.4581,"type":"Put","strike":132.0,"strikeDist":-0.0044,"expiry":"2026-06-05","earnings":"2026-09-04","endsBeforeEarnings":"Yes","optionPrice":4.73,"annualReturn":0.6504},{"name":"Bristol-Myers Squibb Company","price":57.0,"iv":0.2353,"ivRank":0.3095,"type":"Put","strike":57.0,"strikeDist":0.0,"expiry":"2026-05-29","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":1.02,"annualReturn":0.5},{"name":"Bristol-Myers Squibb Company","price":57.0,"iv":0.2353,"ivRank":0.3095,"type":"Put","strike":57.0,"strikeDist":0.0,"expiry":"2026-06-05","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":1.3,"annualReturn":0.4146},{"name":"Bristol-Myers Squibb Company","price":57.0,"iv":0.2666,"ivRank":0.3095,"type":"Put","strike":57.0,"strikeDist":0.0,"expiry":"2026-05-22","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":0.78,"annualReturn":0.8378},{"name":"Coinbase Global Cl A","price":195.43,"iv":0.6529,"ivRank":0.4458,"type":"Put","strike":195.0,"strikeDist":-0.0022,"expiry":"2026-06-05","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":11.8,"annualReturn":1.1019},{"name":"Coinbase Global Cl A","price":195.43,"iv":0.6692,"ivRank":0.4458,"type":"Put","strike":195.0,"strikeDist":-0.0022,"expiry":"2026-05-29","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":9.65,"annualReturn":1.3864},{"name":"Coinbase Global Cl A","price":195.43,"iv":0.7329,"ivRank":0.4458,"type":"Put","strike":195.0,"strikeDist":-0.0022,"expiry":"2026-05-22","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":6.98,"annualReturn":2.1712},{"name":"Salesforce Inc","price":173.51,"iv":0.4744,"ivRank":0.8233,"type":"Put","strike":172.5,"strikeDist":-0.0058,"expiry":"2026-05-22","earnings":"2026-05-27","endsBeforeEarnings":"Yes","optionPrice":3.65,"annualReturn":1.2797},{"name":"Salesforce Inc","price":173.51,"iv":0.6815,"ivRank":0.8233,"type":"Put","strike":172.5,"strikeDist":-0.0058,"expiry":"2026-05-29","earnings":"2026-05-27","endsBeforeEarnings":"No","optionPrice":8.28,"annualReturn":1.339},{"name":"Crowdstrike Holdings","price":594.08,"iv":0.5152,"ivRank":0.7397,"type":"Put","strike":592.5,"strikeDist":-0.0027,"expiry":"2026-05-22","earnings":"2026-06-03","endsBeforeEarnings":"Yes","optionPrice":14.83,"annualReturn":1.5181},{"name":"Crowdstrike Holdings","price":594.08,"iv":0.532,"ivRank":0.7397,"type":"Put","strike":590.0,"strikeDist":-0.0069,"expiry":"2026-05-22","earnings":"2026-06-03","endsBeforeEarnings":"Yes","optionPrice":13.63,"annualReturn":1.3952},{"name":"Crowdstrike Holdings","price":594.08,"iv":0.5959,"ivRank":0.7397,"type":"Put","strike":590.0,"strikeDist":-0.0069,"expiry":"2026-06-05","earnings":"2026-06-03","endsBeforeEarnings":"No","optionPrice":30.4,"annualReturn":0.9339},{"name":"Crowdstrike Holdings","price":594.08,"iv":0.4945,"ivRank":0.7397,"type":"Put","strike":592.5,"strikeDist":-0.0027,"expiry":"2026-05-29","earnings":"2026-06-03","endsBeforeEarnings":"Yes","optionPrice":20.55,"annualReturn":0.9712},{"name":"Crowdstrike Holdings","price":594.08,"iv":0.49,"ivRank":0.7397,"type":"Put","strike":590.0,"strikeDist":-0.0069,"expiry":"2026-05-29","earnings":"2026-06-03","endsBeforeEarnings":"Yes","optionPrice":19.53,"annualReturn":0.9228},{"name":"Walt Disney Company","price":102.72,"iv":0.2666,"ivRank":0.2707,"type":"Put","strike":102.0,"strikeDist":-0.007,"expiry":"2026-05-22","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.05,"annualReturn":0.6189},{"name":"Walt Disney Company","price":102.72,"iv":0.2472,"ivRank":0.2707,"type":"Put","strike":102.0,"strikeDist":-0.007,"expiry":"2026-06-05","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.94,"annualReturn":0.3438},{"name":"Walt Disney Company","price":102.72,"iv":0.2532,"ivRank":0.2707,"type":"Put","strike":102.0,"strikeDist":-0.007,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.51,"annualReturn":0.4114},{"name":"Etsy Inc","price":58.07,"iv":0.5426,"ivRank":0.3362,"type":"Put","strike":58.0,"strikeDist":-0.0012,"expiry":"2026-05-22","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":1.58,"annualReturn":1.6552},{"name":"Etsy Inc","price":58.07,"iv":0.5072,"ivRank":0.3362,"type":"Put","strike":58.0,"strikeDist":-0.0012,"expiry":"2026-06-05","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":2.66,"annualReturn":0.836},{"name":"Etsy Inc","price":58.07,"iv":0.5022,"ivRank":0.3362,"type":"Put","strike":58.0,"strikeDist":-0.0012,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":2.13,"annualReturn":1.0274},{"name":"Fortinet Inc","price":122.78,"iv":0.3748,"ivRank":0.4058,"type":"Put","strike":122.0,"strikeDist":-0.0064,"expiry":"2026-06-05","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":3.8,"annualReturn":0.5648},{"name":"Fortinet Inc","price":122.78,"iv":0.4075,"ivRank":0.4058,"type":"Put","strike":122.0,"strikeDist":-0.0064,"expiry":"2026-05-22","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":2.14,"annualReturn":1.0578},{"name":"Fortinet Inc","price":122.78,"iv":0.3785,"ivRank":0.4058,"type":"Put","strike":122.0,"strikeDist":-0.0064,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":3.05,"annualReturn":0.6963},{"name":"Alphabet Cl C","price":393.32,"iv":0.3216,"ivRank":0.3563,"type":"Put","strike":392.5,"strikeDist":-0.0021,"expiry":"2026-05-29","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":9.18,"annualReturn":0.655},{"name":"Alphabet Cl C","price":393.32,"iv":0.3707,"ivRank":0.3563,"type":"Put","strike":392.5,"strikeDist":-0.0021,"expiry":"2026-05-22","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":6.93,"annualReturn":1.0711},{"name":"Robinhood Markets Inc Cl A","price":77.14,"iv":0.5991,"ivRank":0.2709,"type":"Put","strike":77.0,"strikeDist":-0.0018,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":3.35,"annualReturn":1.2193},{"name":"Robinhood Markets Inc Cl A","price":77.14,"iv":0.5993,"ivRank":0.2709,"type":"Put","strike":77.0,"strikeDist":-0.0018,"expiry":"2026-06-05","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":4.18,"annualReturn":0.9877},{"name":"Robinhood Markets Inc Cl A","price":77.14,"iv":0.6445,"ivRank":0.2709,"type":"Put","strike":77.0,"strikeDist":-0.0018,"expiry":"2026-05-22","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":2.4,"annualReturn":1.8927},{"name":"Intel Corp","price":108.77,"iv":0.7916,"ivRank":0.7529,"type":"Put","strike":108.0,"strikeDist":-0.0071,"expiry":"2026-05-29","earnings":"2026-07-23","endsBeforeEarnings":"Yes","optionPrice":6.1,"annualReturn":1.5746},{"name":"Intel Corp","price":108.77,"iv":0.8917,"ivRank":0.7529,"type":"Put","strike":108.0,"strikeDist":-0.0071,"expiry":"2026-05-22","earnings":"2026-07-23","endsBeforeEarnings":"Yes","optionPrice":4.5,"annualReturn":2.5168},{"name":"Intel Corp","price":108.77,"iv":0.8081,"ivRank":0.7529,"type":"Put","strike":108.0,"strikeDist":-0.0071,"expiry":"2026-06-05","earnings":"2026-07-23","endsBeforeEarnings":"Yes","optionPrice":7.7,"annualReturn":1.2919},{"name":"Lam Research Corp","price":284.72,"iv":0.6921,"ivRank":0.7773,"type":"Put","strike":285.0,"strikeDist":0.001,"expiry":"2026-05-22","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":10.55,"annualReturn":2.1943},{"name":"Lam Research Corp","price":284.72,"iv":0.7178,"ivRank":0.7773,"type":"Put","strike":282.5,"strikeDist":-0.0078,"expiry":"2026-05-22","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":9.0,"annualReturn":1.9229},{"name":"Lam Research Corp","price":284.72,"iv":0.6352,"ivRank":0.7773,"type":"Put","strike":285.0,"strikeDist":0.001,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":13.58,"annualReturn":1.3111},{"name":"Lam Research Corp","price":284.72,"iv":0.6635,"ivRank":0.7773,"type":"Put","strike":282.5,"strikeDist":-0.0078,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":12.95,"annualReturn":1.277},{"name":"Lam Research Corp","price":284.72,"iv":0.6321,"ivRank":0.7773,"type":"Put","strike":285.0,"strikeDist":0.001,"expiry":"2026-06-05","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":17.0,"annualReturn":1.0717},{"name":"Mastercard Inc","price":494.2,"iv":0.2651,"ivRank":0.6083,"type":"Put","strike":492.5,"strikeDist":-0.0034,"expiry":"2026-05-29","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":8.85,"annualReturn":0.5028},{"name":"Mastercard Inc","price":494.2,"iv":0.2808,"ivRank":0.6083,"type":"Put","strike":492.5,"strikeDist":-0.0034,"expiry":"2026-05-22","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":5.9,"annualReturn":0.7263},{"name":"McDonald's Corp","price":276.39,"iv":0.2042,"ivRank":0.5151,"type":"Put","strike":275.0,"strikeDist":-0.005,"expiry":"2026-05-22","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":2.22,"annualReturn":0.4875},{"name":"McDonald's Corp","price":276.39,"iv":0.1926,"ivRank":0.5151,"type":"Put","strike":275.0,"strikeDist":-0.005,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":3.33,"annualReturn":0.3378},{"name":"McDonald's Corp","price":276.39,"iv":0.2326,"ivRank":0.5151,"type":"Put","strike":275.0,"strikeDist":-0.005,"expiry":"2026-06-05","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":4.98,"annualReturn":0.3285},{"name":"Mongodb Inc Cl A","price":312.16,"iv":1.0268,"ivRank":0.8046,"type":"Put","strike":310.0,"strikeDist":-0.0069,"expiry":"2026-06-05","earnings":"2026-05-28","endsBeforeEarnings":"No","optionPrice":28.25,"annualReturn":1.6516},{"name":"Mongodb Inc Cl A","price":312.16,"iv":0.6837,"ivRank":0.8046,"type":"Put","strike":310.0,"strikeDist":-0.0069,"expiry":"2026-05-22","earnings":"2026-05-28","endsBeforeEarnings":"Yes","optionPrice":9.98,"annualReturn":1.9439},{"name":"Mongodb Inc Cl A","price":312.16,"iv":1.1424,"ivRank":0.8046,"type":"Put","strike":310.0,"strikeDist":-0.0069,"expiry":"2026-05-29","earnings":"2026-05-28","endsBeforeEarnings":"No","optionPrice":25.5,"annualReturn":2.2936},{"name":"META Platforms Inc","price":614.23,"iv":0.3542,"ivRank":0.3534,"type":"Put","strike":612.5,"strikeDist":-0.0028,"expiry":"2026-05-20","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":7.68,"annualReturn":1.1402},{"name":"META Platforms Inc","price":614.23,"iv":0.3526,"ivRank":0.3534,"type":"Put","strike":610.0,"strikeDist":-0.0069,"expiry":"2026-05-20","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":6.83,"annualReturn":1.0139},{"name":"META Platforms Inc","price":614.23,"iv":0.3406,"ivRank":0.3534,"type":"Put","strike":612.5,"strikeDist":-0.0028,"expiry":"2026-05-22","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":10.02,"annualReturn":0.9929},{"name":"META Platforms Inc","price":614.23,"iv":0.3455,"ivRank":0.3534,"type":"Put","strike":610.0,"strikeDist":-0.0069,"expiry":"2026-05-22","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":8.73,"annualReturn":0.8641},{"name":"META Platforms Inc","price":614.23,"iv":0.2971,"ivRank":0.3534,"type":"Put","strike":612.5,"strikeDist":-0.0028,"expiry":"2026-05-26","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":10.95,"annualReturn":0.6507},{"name":"META Platforms Inc","price":614.23,"iv":0.2765,"ivRank":0.3534,"type":"Put","strike":610.0,"strikeDist":-0.0069,"expiry":"2026-05-26","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":9.9,"annualReturn":0.5883},{"name":"META Platforms Inc","price":614.23,"iv":0.3142,"ivRank":0.3534,"type":"Put","strike":612.5,"strikeDist":-0.0028,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":13.5,"annualReturn":0.6171},{"name":"META Platforms Inc","price":614.23,"iv":0.3193,"ivRank":0.3534,"type":"Put","strike":610.0,"strikeDist":-0.0069,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":12.2,"annualReturn":0.5577},{"name":"META Platforms Inc","price":614.23,"iv":0.3168,"ivRank":0.3534,"type":"Put","strike":610.0,"strikeDist":-0.0069,"expiry":"2026-06-05","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":15.55,"annualReturn":0.462},{"name":"META Platforms Inc","price":614.23,"iv":0.3341,"ivRank":0.3534,"type":"Put","strike":612.5,"strikeDist":-0.0028,"expiry":"2026-05-27","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":11.88,"annualReturn":0.6415},{"name":"META Platforms Inc","price":614.23,"iv":0.2948,"ivRank":0.3534,"type":"Put","strike":610.0,"strikeDist":-0.0069,"expiry":"2026-05-27","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":10.25,"annualReturn":0.5537},{"name":"Altria Group","price":73.09,"iv":0.2198,"ivRank":0.6701,"type":"Put","strike":73.0,"strikeDist":-0.0012,"expiry":"2026-06-05","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":1.42,"annualReturn":0.3533},{"name":"Altria Group","price":73.09,"iv":0.223,"ivRank":0.6701,"type":"Put","strike":73.0,"strikeDist":-0.0012,"expiry":"2026-05-22","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":0.79,"annualReturn":0.6575},{"name":"Altria Group","price":73.09,"iv":0.2093,"ivRank":0.6701,"type":"Put","strike":73.0,"strikeDist":-0.0012,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":1.05,"annualReturn":0.4014},{"name":"Merck & Company","price":111.38,"iv":0.2548,"ivRank":0.4665,"type":"Put","strike":111.0,"strikeDist":-0.0034,"expiry":"2026-06-05","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":2.84,"annualReturn":0.4662},{"name":"Merck & Company","price":111.38,"iv":0.2793,"ivRank":0.4665,"type":"Put","strike":111.0,"strikeDist":-0.0034,"expiry":"2026-05-22","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":1.38,"annualReturn":0.751},{"name":"Merck & Company","price":111.38,"iv":0.2625,"ivRank":0.4665,"type":"Put","strike":111.0,"strikeDist":-0.0034,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":1.99,"annualReturn":0.5016},{"name":"Moderna Inc","price":49.04,"iv":0.78,"ivRank":0.4168,"type":"Put","strike":49.0,"strikeDist":-0.0008,"expiry":"2026-06-05","earnings":"2026-08-07","endsBeforeEarnings":"Yes","optionPrice":3.55,"annualReturn":1.3211},{"name":"Moderna Inc","price":49.04,"iv":0.77,"ivRank":0.4168,"type":"Put","strike":49.0,"strikeDist":-0.0008,"expiry":"2026-05-29","earnings":"2026-08-07","endsBeforeEarnings":"Yes","optionPrice":2.8,"annualReturn":1.6059},{"name":"Moderna Inc","price":49.04,"iv":0.7594,"ivRank":0.4168,"type":"Put","strike":49.0,"strikeDist":-0.0008,"expiry":"2026-05-22","earnings":"2026-08-07","endsBeforeEarnings":"Yes","optionPrice":2.09,"annualReturn":2.5926},{"name":"Microsoft Corp","price":421.92,"iv":0.3044,"ivRank":0.5428,"type":"Put","strike":420.0,"strikeDist":-0.0046,"expiry":"2026-05-26","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":7.3,"annualReturn":0.6315},{"name":"Microsoft Corp","price":421.92,"iv":0.2775,"ivRank":0.5428,"type":"Put","strike":420.0,"strikeDist":-0.0046,"expiry":"2026-05-27","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":7.6,"annualReturn":0.5977},{"name":"Microsoft Corp","price":421.92,"iv":0.3518,"ivRank":0.5428,"type":"Put","strike":420.0,"strikeDist":-0.0046,"expiry":"2026-05-20","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":5.2,"annualReturn":1.1246},{"name":"Microsoft Corp","price":421.92,"iv":0.3507,"ivRank":0.5428,"type":"Put","strike":420.0,"strikeDist":-0.0046,"expiry":"2026-05-22","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":6.63,"annualReturn":0.9552},{"name":"Microsoft Corp","price":421.92,"iv":0.3063,"ivRank":0.5428,"type":"Put","strike":420.0,"strikeDist":-0.0046,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":8.75,"annualReturn":0.5823},{"name":"Microsoft Corp","price":421.92,"iv":0.3082,"ivRank":0.5428,"type":"Put","strike":420.0,"strikeDist":-0.0046,"expiry":"2026-06-05","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":10.75,"annualReturn":0.465},{"name":"Strategy Inc","price":177.42,"iv":0.6453,"ivRank":0.3164,"type":"Put","strike":177.5,"strikeDist":0.0005,"expiry":"2026-05-29","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":8.55,"annualReturn":1.3404},{"name":"Strategy Inc","price":177.42,"iv":0.6953,"ivRank":0.3164,"type":"Put","strike":177.5,"strikeDist":0.0005,"expiry":"2026-05-22","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":6.2,"annualReturn":2.0984},{"name":"Strategy Inc","price":177.42,"iv":0.6659,"ivRank":0.3164,"type":"Put","strike":177.5,"strikeDist":0.0005,"expiry":"2026-06-05","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":10.9,"annualReturn":1.113},{"name":"Micron Technology","price":724.66,"iv":0.8983,"ivRank":0.8425,"type":"Put","strike":725.0,"strikeDist":0.0005,"expiry":"2026-06-05","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":60.4,"annualReturn":1.5126},{"name":"Micron Technology","price":724.66,"iv":0.9015,"ivRank":0.8425,"type":"Put","strike":720.0,"strikeDist":-0.0064,"expiry":"2026-06-05","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":57.85,"annualReturn":1.4569},{"name":"Micron Technology","price":724.66,"iv":1.043,"ivRank":0.8425,"type":"Put","strike":725.0,"strikeDist":0.0005,"expiry":"2026-05-22","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":38.68,"annualReturn":3.2181},{"name":"Micron Technology","price":724.66,"iv":1.0417,"ivRank":0.8425,"type":"Put","strike":722.5,"strikeDist":-0.003,"expiry":"2026-05-22","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":37.4,"annualReturn":3.1396},{"name":"Micron Technology","price":724.66,"iv":1.0422,"ivRank":0.8425,"type":"Put","strike":720.0,"strikeDist":-0.0064,"expiry":"2026-05-22","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":35.95,"annualReturn":3.0179},{"name":"Micron Technology","price":724.66,"iv":0.9222,"ivRank":0.8425,"type":"Put","strike":725.0,"strikeDist":0.0005,"expiry":"2026-05-29","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":50.33,"annualReturn":1.9367},{"name":"Micron Technology","price":724.66,"iv":0.9249,"ivRank":0.8425,"type":"Put","strike":722.5,"strikeDist":-0.003,"expiry":"2026-05-29","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":48.83,"annualReturn":1.8917},{"name":"Micron Technology","price":724.66,"iv":0.9125,"ivRank":0.8425,"type":"Put","strike":720.0,"strikeDist":-0.0064,"expiry":"2026-05-29","earnings":"2026-06-24","endsBeforeEarnings":"Yes","optionPrice":47.58,"annualReturn":1.8433},{"name":"Cloudflare Inc Cl A","price":197.56,"iv":0.6221,"ivRank":0.4435,"type":"Put","strike":197.5,"strikeDist":-0.0003,"expiry":"2026-05-29","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":9.02,"annualReturn":1.2826},{"name":"Cloudflare Inc Cl A","price":197.56,"iv":0.7014,"ivRank":0.4435,"type":"Put","strike":197.5,"strikeDist":-0.0003,"expiry":"2026-05-22","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":6.9,"annualReturn":2.1247},{"name":"Netflix Inc","price":87.02,"iv":0.3198,"ivRank":0.27,"type":"Put","strike":87.0,"strikeDist":-0.0002,"expiry":"2026-05-22","earnings":"2026-07-16","endsBeforeEarnings":"Yes","optionPrice":1.4,"annualReturn":0.9787},{"name":"Netflix Inc","price":87.02,"iv":0.3061,"ivRank":0.27,"type":"Put","strike":87.0,"strikeDist":-0.0002,"expiry":"2026-06-05","earnings":"2026-07-16","endsBeforeEarnings":"Yes","optionPrice":2.4,"annualReturn":0.5033},{"name":"Netflix Inc","price":87.02,"iv":0.2961,"ivRank":0.27,"type":"Put","strike":87.0,"strikeDist":-0.0002,"expiry":"2026-05-29","earnings":"2026-07-16","endsBeforeEarnings":"Yes","optionPrice":1.89,"annualReturn":0.6098},{"name":"Nvidia Corp","price":225.32,"iv":0.524,"ivRank":0.7059,"type":"Put","strike":225.0,"strikeDist":-0.0014,"expiry":"2026-06-05","earnings":"2026-05-20","endsBeforeEarnings":"No","optionPrice":10.68,"annualReturn":0.8646},{"name":"Nvidia Corp","price":225.32,"iv":0.7401,"ivRank":0.7059,"type":"Put","strike":225.0,"strikeDist":-0.0014,"expiry":"2026-05-22","earnings":"2026-05-20","endsBeforeEarnings":"No","optionPrice":8.23,"annualReturn":2.2206},{"name":"Nvidia Corp","price":225.32,"iv":0.5778,"ivRank":0.7059,"type":"Put","strike":225.0,"strikeDist":-0.0014,"expiry":"2026-05-29","earnings":"2026-05-20","endsBeforeEarnings":"No","optionPrice":9.45,"annualReturn":1.1776},{"name":"Nvidia Corp","price":225.32,"iv":0.5961,"ivRank":0.7059,"type":"Put","strike":225.0,"strikeDist":-0.0014,"expiry":"2026-05-26","earnings":"2026-05-20","endsBeforeEarnings":"No","optionPrice":8.7,"annualReturn":1.4093},{"name":"Nvidia Corp","price":225.32,"iv":0.5928,"ivRank":0.7059,"type":"Put","strike":225.0,"strikeDist":-0.0014,"expiry":"2026-05-27","earnings":"2026-05-20","endsBeforeEarnings":"No","optionPrice":9.05,"annualReturn":1.3328},{"name":"Novo Nordisk A/S ADR","price":44.74,"iv":0.3955,"ivRank":0.1337,"type":"Put","strike":44.5,"strikeDist":-0.0054,"expiry":"2026-05-22","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":0.76,"annualReturn":1.0334},{"name":"Novo Nordisk A/S ADR","price":44.74,"iv":0.3601,"ivRank":0.1337,"type":"Put","strike":44.5,"strikeDist":-0.0054,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.12,"annualReturn":0.6997},{"name":"Oracle Corp","price":192.95,"iv":0.6169,"ivRank":0.8644,"type":"Put","strike":192.5,"strikeDist":-0.0023,"expiry":"2026-05-22","earnings":"2026-06-10","endsBeforeEarnings":"Yes","optionPrice":5.93,"annualReturn":1.868},{"name":"Oracle Corp","price":192.95,"iv":0.559,"ivRank":0.8644,"type":"Put","strike":192.5,"strikeDist":-0.0023,"expiry":"2026-06-05","earnings":"2026-06-10","endsBeforeEarnings":"Yes","optionPrice":9.9,"annualReturn":0.9364},{"name":"Oracle Corp","price":192.95,"iv":0.5644,"ivRank":0.8644,"type":"Put","strike":192.5,"strikeDist":-0.0023,"expiry":"2026-05-29","earnings":"2026-06-10","endsBeforeEarnings":"Yes","optionPrice":7.83,"annualReturn":1.1386},{"name":"Palo Alto Networks","price":242.83,"iv":0.5333,"ivRank":1.0,"type":"Put","strike":242.5,"strikeDist":-0.0014,"expiry":"2026-05-22","earnings":"2026-06-02","endsBeforeEarnings":"Yes","optionPrice":6.48,"annualReturn":1.6221},{"name":"Palo Alto Networks","price":242.83,"iv":0.5068,"ivRank":1.0,"type":"Put","strike":242.5,"strikeDist":-0.0014,"expiry":"2026-05-29","earnings":"2026-06-02","endsBeforeEarnings":"Yes","optionPrice":8.58,"annualReturn":0.9915},{"name":"Palantir Technologies Cl A","price":133.99,"iv":0.469,"ivRank":0.2158,"type":"Put","strike":134.0,"strikeDist":0.0001,"expiry":"2026-06-05","earnings":"2026-08-03","endsBeforeEarnings":"Yes","optionPrice":5.85,"annualReturn":0.7954},{"name":"Palantir Technologies Cl A","price":133.99,"iv":0.4853,"ivRank":0.2158,"type":"Put","strike":133.0,"strikeDist":-0.0074,"expiry":"2026-06-05","earnings":"2026-08-03","endsBeforeEarnings":"Yes","optionPrice":5.45,"annualReturn":0.7423},{"name":"Palantir Technologies Cl A","price":133.99,"iv":0.508,"ivRank":0.2158,"type":"Put","strike":134.0,"strikeDist":0.0001,"expiry":"2026-05-22","earnings":"2026-08-03","endsBeforeEarnings":"Yes","optionPrice":3.45,"annualReturn":1.5618},{"name":"Palantir Technologies Cl A","price":133.99,"iv":0.5121,"ivRank":0.2158,"type":"Put","strike":133.0,"strikeDist":-0.0074,"expiry":"2026-05-22","earnings":"2026-08-03","endsBeforeEarnings":"Yes","optionPrice":3.01,"annualReturn":1.3643},{"name":"Palantir Technologies Cl A","price":133.99,"iv":0.4803,"ivRank":0.2158,"type":"Put","strike":134.0,"strikeDist":0.0001,"expiry":"2026-05-29","earnings":"2026-08-03","endsBeforeEarnings":"Yes","optionPrice":4.75,"annualReturn":0.9932},{"name":"Palantir Technologies Cl A","price":133.99,"iv":0.478,"ivRank":0.2158,"type":"Put","strike":133.0,"strikeDist":-0.0074,"expiry":"2026-05-29","earnings":"2026-08-03","endsBeforeEarnings":"Yes","optionPrice":4.2,"annualReturn":0.8801},{"name":"Qualcomm Inc","price":201.49,"iv":0.8168,"ivRank":0.7669,"type":"Put","strike":200.0,"strikeDist":-0.0074,"expiry":"2026-05-22","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":7.5,"annualReturn":2.2644},{"name":"Qualcomm Inc","price":201.49,"iv":0.738,"ivRank":0.7669,"type":"Put","strike":200.0,"strikeDist":-0.0074,"expiry":"2026-05-29","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":10.35,"annualReturn":1.4422},{"name":"Qualcomm Inc","price":201.49,"iv":0.7283,"ivRank":0.7669,"type":"Put","strike":200.0,"strikeDist":-0.0074,"expiry":"2026-06-05","earnings":"2026-07-29","endsBeforeEarnings":"Yes","optionPrice":12.8,"annualReturn":1.1594},{"name":"Roku Inc","price":124.02,"iv":0.4867,"ivRank":0.1649,"type":"Put","strike":124.0,"strikeDist":-0.0002,"expiry":"2026-05-29","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":4.25,"annualReturn":0.9622},{"name":"Roku Inc","price":124.02,"iv":0.4751,"ivRank":0.1649,"type":"Put","strike":124.0,"strikeDist":-0.0002,"expiry":"2026-05-22","earnings":"2026-07-30","endsBeforeEarnings":"Yes","optionPrice":3.07,"annualReturn":1.5034},{"name":"Starbucks Corp","price":106.82,"iv":0.3079,"ivRank":0.1182,"type":"Put","strike":106.0,"strikeDist":-0.0077,"expiry":"2026-05-22","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":1.24,"annualReturn":0.7033},{"name":"Starbucks Corp","price":106.82,"iv":0.2944,"ivRank":0.1182,"type":"Put","strike":106.0,"strikeDist":-0.0077,"expiry":"2026-06-05","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":2.42,"annualReturn":0.4126},{"name":"Starbucks Corp","price":106.82,"iv":0.298,"ivRank":0.1182,"type":"Put","strike":106.0,"strikeDist":-0.0077,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":1.93,"annualReturn":0.5073},{"name":"Sea Ltd ADR","price":88.23,"iv":0.5366,"ivRank":0.4235,"type":"Put","strike":88.0,"strikeDist":-0.0026,"expiry":"2026-06-05","earnings":"2026-08-11","endsBeforeEarnings":"Yes","optionPrice":4.2,"annualReturn":0.8688},{"name":"Sea Ltd ADR","price":88.23,"iv":0.5187,"ivRank":0.4235,"type":"Put","strike":88.0,"strikeDist":-0.0026,"expiry":"2026-05-29","earnings":"2026-08-11","endsBeforeEarnings":"Yes","optionPrice":3.28,"annualReturn":1.0422},{"name":"Sea Ltd ADR","price":88.23,"iv":0.5652,"ivRank":0.4235,"type":"Put","strike":88.0,"strikeDist":-0.0026,"expiry":"2026-05-22","earnings":"2026-08-11","endsBeforeEarnings":"Yes","optionPrice":2.51,"annualReturn":1.7306},{"name":"Shopify Inc","price":100.28,"iv":0.5569,"ivRank":0.4357,"type":"Put","strike":100.0,"strikeDist":-0.0028,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":4.05,"annualReturn":1.1339},{"name":"Shopify Inc","price":100.28,"iv":0.5756,"ivRank":0.4357,"type":"Put","strike":100.0,"strikeDist":-0.0028,"expiry":"2026-06-05","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":5.05,"annualReturn":0.9191},{"name":"Shopify Inc","price":100.28,"iv":0.5984,"ivRank":0.4357,"type":"Put","strike":100.0,"strikeDist":-0.0028,"expiry":"2026-05-22","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":2.84,"annualReturn":1.7228},{"name":"Snowflake Inc Cl A","price":157.47,"iv":0.7138,"ivRank":1.0,"type":"Put","strike":157.5,"strikeDist":0.0002,"expiry":"2026-05-22","earnings":"2026-05-27","endsBeforeEarnings":"Yes","optionPrice":5.8,"annualReturn":2.229},{"name":"Snowflake Inc Cl A","price":157.47,"iv":1.0553,"ivRank":1.0,"type":"Put","strike":157.5,"strikeDist":0.0002,"expiry":"2026-05-29","earnings":"2026-05-27","endsBeforeEarnings":"No","optionPrice":12.38,"annualReturn":2.2011},{"name":"T-Mobile US","price":185.22,"iv":0.3113,"ivRank":0.5013,"type":"Put","strike":185.0,"strikeDist":-0.0012,"expiry":"2026-06-05","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":5.2,"annualReturn":0.5124},{"name":"T-Mobile US","price":185.22,"iv":0.2322,"ivRank":0.5013,"type":"Put","strike":185.0,"strikeDist":-0.0012,"expiry":"2026-05-22","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":2.15,"annualReturn":0.7061},{"name":"T-Mobile US","price":185.22,"iv":0.3017,"ivRank":0.5013,"type":"Put","strike":185.0,"strikeDist":-0.0012,"expiry":"2026-05-29","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":4.05,"annualReturn":0.6139},{"name":"Tesla Inc","price":422.24,"iv":0.4199,"ivRank":0.1625,"type":"Put","strike":422.5,"strikeDist":0.0006,"expiry":"2026-05-26","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":11.53,"annualReturn":0.9738},{"name":"Tesla Inc","price":422.24,"iv":0.4141,"ivRank":0.1625,"type":"Put","strike":420.0,"strikeDist":-0.0053,"expiry":"2026-05-26","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":10.28,"annualReturn":0.8882},{"name":"Tesla Inc","price":422.24,"iv":0.4393,"ivRank":0.1625,"type":"Put","strike":422.5,"strikeDist":0.0006,"expiry":"2026-05-29","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":13.85,"annualReturn":0.9037},{"name":"Tesla Inc","price":422.24,"iv":0.4425,"ivRank":0.1625,"type":"Put","strike":420.0,"strikeDist":-0.0053,"expiry":"2026-05-29","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":12.6,"annualReturn":0.8378},{"name":"Tesla Inc","price":422.24,"iv":0.4732,"ivRank":0.1625,"type":"Put","strike":422.5,"strikeDist":0.0006,"expiry":"2026-05-20","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":8.35,"annualReturn":1.7483},{"name":"Tesla Inc","price":422.24,"iv":0.4729,"ivRank":0.1625,"type":"Put","strike":420.0,"strikeDist":-0.0053,"expiry":"2026-05-20","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":7.18,"annualReturn":1.5506},{"name":"Tesla Inc","price":422.24,"iv":0.4399,"ivRank":0.1625,"type":"Put","strike":420.0,"strikeDist":-0.0053,"expiry":"2026-06-05","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":15.88,"annualReturn":0.6861},{"name":"Tesla Inc","price":422.24,"iv":0.4743,"ivRank":0.1625,"type":"Put","strike":422.5,"strikeDist":0.0006,"expiry":"2026-05-22","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":10.38,"annualReturn":1.4573},{"name":"Tesla Inc","price":422.24,"iv":0.4753,"ivRank":0.1625,"type":"Put","strike":420.0,"strikeDist":-0.0053,"expiry":"2026-05-22","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":9.13,"annualReturn":1.3147},{"name":"Tesla Inc","price":422.24,"iv":0.4241,"ivRank":0.1625,"type":"Put","strike":422.5,"strikeDist":0.0006,"expiry":"2026-05-27","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":12.33,"annualReturn":0.9481},{"name":"Tesla Inc","price":422.24,"iv":0.4213,"ivRank":0.1625,"type":"Put","strike":420.0,"strikeDist":-0.0053,"expiry":"2026-05-27","earnings":"2026-07-22","endsBeforeEarnings":"Yes","optionPrice":11.08,"annualReturn":0.8703},{"name":"Taiwan Semiconductor ADR","price":404.35,"iv":0.4692,"ivRank":0.6699,"type":"Put","strike":402.5,"strikeDist":-0.0046,"expiry":"2026-05-22","earnings":"2026-07-16","endsBeforeEarnings":"Yes","optionPrice":8.55,"annualReturn":1.2863},{"name":"Taiwan Semiconductor ADR","price":404.35,"iv":0.4417,"ivRank":0.6699,"type":"Put","strike":402.5,"strikeDist":-0.0046,"expiry":"2026-05-29","earnings":"2026-07-16","endsBeforeEarnings":"Yes","optionPrice":12.33,"annualReturn":0.8558},{"name":"UBER Technologies Inc","price":75.09,"iv":0.3659,"ivRank":0.347,"type":"Put","strike":75.0,"strikeDist":-0.0012,"expiry":"2026-05-22","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.3,"annualReturn":1.0532},{"name":"UBER Technologies Inc","price":75.09,"iv":0.3616,"ivRank":0.347,"type":"Put","strike":75.0,"strikeDist":-0.0012,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":1.96,"annualReturn":0.731},{"name":"UBER Technologies Inc","price":75.09,"iv":0.3584,"ivRank":0.347,"type":"Put","strike":75.0,"strikeDist":-0.0012,"expiry":"2026-06-05","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":2.4,"annualReturn":0.5821},{"name":"Visa Inc","price":325.75,"iv":0.2365,"ivRank":0.4092,"type":"Put","strike":325.0,"strikeDist":-0.0023,"expiry":"2026-06-05","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":6.6,"annualReturn":0.3698},{"name":"Visa Inc","price":325.75,"iv":0.2199,"ivRank":0.4092,"type":"Put","strike":325.0,"strikeDist":-0.0023,"expiry":"2026-05-29","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":5.13,"annualReturn":0.4417},{"name":"Visa Inc","price":325.75,"iv":0.2559,"ivRank":0.4092,"type":"Put","strike":325.0,"strikeDist":-0.0023,"expiry":"2026-05-22","earnings":"2026-08-04","endsBeforeEarnings":"Yes","optionPrice":3.7,"annualReturn":0.691},{"name":"Sea Ltd ADR","price":88.23,"iv":0.5074,"ivRank":0.4235,"type":"Put","strike":84.0,"strikeDist":-0.0479,"expiry":"2026-05-29","earnings":"2026-08-11","endsBeforeEarnings":"Yes","optionPrice":1.57,"annualReturn":0.498},{"name":"Barrick Mining Corp","price":40.61,"iv":0.5135,"ivRank":0.5866,"type":"Put","strike":38.5,"strikeDist":-0.052,"expiry":"2026-05-29","earnings":"2026-08-10","endsBeforeEarnings":"Yes","optionPrice":0.6,"annualReturn":0.4114},{"name":"Barrick Mining Corp","price":40.61,"iv":0.4448,"ivRank":0.5866,"type":"Call","strike":43.0,"strikeDist":-0.0589,"expiry":"2026-05-29","earnings":"2026-08-10","endsBeforeEarnings":"Yes","optionPrice":0.52,"annualReturn":0.3561},{"name":"Lyft Inc Cl A","price":12.97,"iv":0.4828,"ivRank":0.2069,"type":"Put","strike":12.5,"strikeDist":-0.0362,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":0.25,"annualReturn":0.5304},{"name":"Lyft Inc Cl A","price":12.97,"iv":0.4639,"ivRank":0.2069,"type":"Call","strike":13.5,"strikeDist":-0.0409,"expiry":"2026-05-29","earnings":"2026-08-05","endsBeforeEarnings":"Yes","optionPrice":0.28,"annualReturn":0.6061},{"name":"Datadog Inc Cl A","price":207.98,"iv":0.6577,"ivRank":0.5148,"type":"Call","strike":232.5,"strikeDist":-0.1179,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":2.54,"annualReturn":0.3422},{"name":"Trade Desk Inc","price":21.15,"iv":0.5763,"ivRank":0.3778,"type":"Put","strike":20.0,"strikeDist":-0.0544,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":0.43,"annualReturn":0.5642},{"name":"Trade Desk Inc","price":21.15,"iv":0.6008,"ivRank":0.3778,"type":"Call","strike":23.0,"strikeDist":-0.0875,"expiry":"2026-05-29","earnings":"2026-08-06","endsBeforeEarnings":"Yes","optionPrice":0.33,"annualReturn":0.4447},{"name":"Uipath Inc Cl A","price":10.27,"iv":1.3081,"ivRank":0.8166,"type":"Call","strike":12.5,"strikeDist":-0.2171,"expiry":"2026-05-29","earnings":"2026-05-28","endsBeforeEarnings":"No","optionPrice":0.31,"annualReturn":0.8475}]}]`;
let SCREENINGS = JSON.parse(SCREENINGS_RAW);

// =============================================================================
// Title overrides — exakte Namen der ursprünglichen Excel-Dokumente
// =============================================================================
const TITLE_OVERRIDES = {
  'hohe-iv':              { title: 'Hohe IV-Screening mit attraktivem Sicherheitspuffer',           tagline: 'Stillhalter-Puts mit hohem IV-Rank und komfortabel weit OTM' },
  'outperformance':       { title: 'Outperformance-Screening mit attraktivem IV-Rank',              tagline: 'Aktien mit Outperformance ggü. S&P 500 und attraktivem IV-Rank' },
  'naked-call':           { title: 'Naked Call-Screening mit überkauften Underlyings',              tagline: 'Short Calls auf technisch überkaufte Aktien (RSI > 70)' },
  '52w-hoch':             { title: '52-Wochenhoch-Momentum-Screening ohne Earnings-Risiko',         tagline: 'Aktien nahe Jahreshoch, Verfall vor Earnings' },
  'etfs':                 { title: 'ETF-Screening mit hohen Renditen bei attraktivem Puffer',       tagline: 'Breit gestreute ETFs mit attraktiver Stillhalterrendite' },
  'dauerlaeufer':         { title: 'Dauerläufer-Screening mit technisch überverkauftem Rücksetzer', tagline: 'Trend-Aktien mit kurzfristigem Pullback (RSI < 35, über GD200)' },
  'aktien-unter-40':      { title: 'Aktien unter 40$ mit attraktiven Stillhalterrenditen',          tagline: 'Geringer Kapitaleinsatz pro Kontrakt, breite Auswahl' },
  'wertloser-verfall':    { title: 'Optionsscreening mit hoher Wahrscheinlichkeit auf wertlosen Verfall', tagline: 'Tief OTM mit kleinem Delta — defensiv und planbar' },
  'stillhalter-universum':{ title: 'Aktien mit attraktiven Stillhalterrenditen',                    tagline: 'Kuratiertes Stillhalter-Universum quer durch Sektoren' },
};
for (const s of SCREENINGS) {
  const override = TITLE_OVERRIDES[s.id];
  if (override) Object.assign(s, override);
}

// =============================================================================
// Accent tokens per screening
// =============================================================================
const ACCENT_TOKENS = {
  emerald: { text: 'text-emerald-300', dot: 'bg-emerald-400' },
  cyan:    { text: 'text-cyan-300',    dot: 'bg-cyan-400' },
  rose:    { text: 'text-rose-300',    dot: 'bg-rose-400' },
  amber:   { text: 'text-amber-300',   dot: 'bg-amber-400' },
  violet:  { text: 'text-violet-300',  dot: 'bg-violet-400' },
  sky:     { text: 'text-sky-300',     dot: 'bg-sky-400' },
  teal:    { text: 'text-teal-300',    dot: 'bg-teal-400' },
  fuchsia: { text: 'text-fuchsia-300', dot: 'bg-fuchsia-400' },
  indigo:  { text: 'text-indigo-300',  dot: 'bg-indigo-400' },
};
const accentOf = (id) => ACCENT_TOKENS[id] || ACCENT_TOKENS.cyan;

// =============================================================================
// Sort order: defensive → aggressive (psychological lead path)
// =============================================================================
const CONSERVATIVENESS_ORDER = [
  'etfs',                  // breite Streuung, defensivst
  'wertloser-verfall',     // hohe POP, kleines Delta
  'stillhalter-universum', // breites Universum
  'hohe-iv',               // hohe IV, aber mit Puffer
  'aktien-unter-40',       // kleines Kapital
  'outperformance',        // momentum, aber stabil
  '52w-hoch',              // momentum
  'dauerlaeufer',          // mean-reversion
  'naked-call',            // aggressivst (überkauft)
];

// =============================================================================
// Formatters
// =============================================================================
const fmt$ = (v) => `$${v.toLocaleString('de-DE', { maximumFractionDigits: 2 })}`;
const fmtPct = (v, d = 1) => `${(v * 100).toFixed(d)} %`;
const fmtDate = (s) => {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  return `${d}.${m}.${y.slice(2)}`;
};

// =============================================================================
// Stats helpers
// =============================================================================
const median = (arr) => {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Median absolute strike distance (the "safety buffer" for stillhalter)
const medianBuffer = (results) =>
  median(results.filter(r => r.name !== 'keine Treffer').map(r => Math.abs(r.strikeDist || 0)));

// Group flat rows into per-stock groups, sorted by best (highest annualReturn)
const groupByStock = (results) => {
  const map = new Map();
  for (const r of results) {
    if (r.name === 'keine Treffer') continue;
    if (!map.has(r.name)) map.set(r.name, []);
    map.get(r.name).push(r);
  }
  return Array.from(map, ([name, rows]) => {
    const sorted = [...rows].sort((a, b) => b.annualReturn - a.annualReturn);
    return { name, rows: sorted, lead: sorted[0], count: sorted.length };
  });
};

// =============================================================================
// Pre-computed per-screening data
// =============================================================================
let SCREENING_DATA;
let SCREENINGS_SORTED;
function rebuildDerived() {
  SCREENING_DATA = new Map(
    SCREENINGS.map(s => {
      const valid = s.results.filter(r => r.name !== 'keine Treffer');
      return [s.id, {
        ...s,
        _validResults: valid,
        _count: valid.length,
        _buffer: medianBuffer(s.results),
        _groups: groupByStock(s.results),
      }];
    })
  );

  SCREENINGS_SORTED = [...SCREENINGS].sort((a, b) => {
    const ai = CONSERVATIVENESS_ORDER.indexOf(a.id);
    const bi = CONSERVATIVENESS_ORDER.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}
rebuildDerived();

// =============================================================================
// Live-Daten: die nächtlich erzeugte /data/screenings.json wird über die
// statischen Metadaten gemergt. Es werden NUR results/stats ersetzt — Titel,
// Filtertexte, Icon und Akzentfarbe bleiben aus dem Code. Fällt der Fetch aus
// (kein File, offline), bleibt der eingebackene Snapshot als Fallback aktiv.
// =============================================================================
const SCREENINGS_JSON_URL = '/data/screenings.json';
let DATA_DATE = '2026-05-21'; // Stand des eingebackenen Fallback-Snapshots

function applyLiveData(live) {
  if (!live || !live.screenings) return false;
  let changed = false;
  for (const s of SCREENINGS) {
    const d = live.screenings[s.id];
    if (d && Array.isArray(d.results)) {
      s.results = d.results;
      if (d.stats) s.stats = d.stats;
      changed = true;
    }
  }
  if (changed) {
    if (live.dataDate) DATA_DATE = live.dataDate;
    rebuildDerived();
  }
  return changed;
}

function standLabel() {
  const [y, m, d] = (DATA_DATE || '').split('-');
  return y ? `Stand ${d}.${m}.${y}` : 'Stand —';
}

// =============================================================================
// === HELP SECTIONS (für den Help-Drawer) =====================================
// =============================================================================
const SCREENINGS_HELP = [
  {
    id: 'overview',
    title: 'Was ist der Screenings-Tab?',
    content: (
      <div className="space-y-3">
        <p>Der Screenings-Tab bündelt <strong>kuratierte Optionsstrategien</strong> für Stillhalter — jedes Screening ist ein eigenständiges Setup mit fest definierten Filterkriterien aus Optionen-, Technik- und Fundamentaldaten.</p>
        <p>Statt selbst Filter zu komponieren, wählst du eine Strategie-These (z.B. „hoher IV-Rank mit Sicherheitspuffer") und siehst sofort die aktuell passenden Aktien und Optionsserien. Die Datensätze stammen aus täglichen Screenings unseres Daten-Backends.</p>
        <p className="text-slate-500 text-xs italic">Stand der angezeigten Daten: siehe Übersichts-Header. In Production-Umgebung wird das Datenfile periodisch neu erzeugt.</p>
      </div>
    ),
  },
  {
    id: 'strategies',
    title: 'Die Strategien im Überblick',
    content: (
      <div className="space-y-3">
        <p>Die Karten sind <strong>nach Risikoprofil</strong> sortiert — von defensiv oben links nach aggressiv unten rechts. Bewusste Reihenfolge, kein Zufall.</p>
        <dl className="space-y-2 text-sm">
          <div><dt className="font-semibold text-slate-200">ETF-Screening</dt><dd className="text-slate-400">Defensivste Variante. ETFs streuen das Einzelaktien-Risiko, Renditen niedriger aber stabiler.</dd></div>
          <div><dt className="font-semibold text-slate-200">Wertloser Verfall</dt><dd className="text-slate-400">Deep OTM mit kleinem Delta (-0,2 bis -0,1). Hohe Wahrscheinlichkeit, dass die Option wertlos verfällt.</dd></div>
          <div><dt className="font-semibold text-slate-200">Aktien mit attraktiven Stillhalterrenditen</dt><dd className="text-slate-400">Das breite Stillhalter-Universum: Über 170 Setups quer durch viele bekannte Aktien.</dd></div>
          <div><dt className="font-semibold text-slate-200">Hohe IV-Screening</dt><dd className="text-slate-400">Aktien mit IV-Rank &gt; 75 % und mind. 8 % Puffer — die Volatilitäts-Prämie bei akzeptablem Risiko abgreifen.</dd></div>
          <div><dt className="font-semibold text-slate-200">Aktien unter 40$</dt><dd className="text-slate-400">Kleiner Kapitaleinsatz pro Kontrakt — geeignet für kleinere Konten und Diversifikation.</dd></div>
          <div><dt className="font-semibold text-slate-200">Outperformance-Screening</dt><dd className="text-slate-400">Aktien die in der Vorwoche &gt; 4 % besser als der S&P 500 liefen. Momentum mit IV-Rank-Anker.</dd></div>
          <div><dt className="font-semibold text-slate-200">52-Wochenhoch-Momentum</dt><dd className="text-slate-400">Aktien nahe Jahreshoch (max. 2 % Abstand), Verfall vor Earnings — klassisches Momentum-Setup.</dd></div>
          <div><dt className="font-semibold text-slate-200">Dauerläufer-Screening</dt><dd className="text-slate-400">Mean-Reversion: Aktien im langfristigen Aufwärtstrend (über GD200) mit kurzfristigem Pullback (RSI &lt; 35).</dd></div>
          <div><dt className="font-semibold text-slate-200">Naked Call-Screening</dt><dd className="text-slate-400">Aggressivste Variante: Short Calls auf überkaufte Aktien (RSI &gt; 70). Unbegrenztes theoretisches Risiko.</dd></div>
        </dl>
      </div>
    ),
  },
  {
    id: 'card-stats',
    title: 'Die Kennzahlen auf den Karten',
    content: (
      <div className="space-y-3">
        <p>Jede Karte zeigt bewusst nur <strong>zwei Zahlen</strong> — sie sollen die Entscheidung leiten, nicht überfrachten:</p>
        <dl className="space-y-2.5">
          <div>
            <dt className="font-semibold text-slate-200">Treffer</dt>
            <dd>Anzahl der aktuell gefundenen Optionsserien. Wenig Treffer = enges Setup oder Markt passt gerade nicht.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-200">Ø Strike-Abstand</dt>
            <dd>Median des absoluten Abstands vom Strike zum aktuellen Kurs. Je größer, desto mehr Sicherheitspuffer — der Strike liegt weiter aus dem Geld.</dd>
          </div>
        </dl>
        <p className="text-slate-500 text-xs italic">Renditen werden auf der Karten-Ebene bewusst nicht gezeigt. Annualisierte Renditen aus 5-Tage-Optionen können dreistellig wirken und einen falschen Eindruck erzeugen. Die echten Werte siehst du in der Detail-Tabelle, dort kontextualisiert mit Strike, Laufzeit und Earnings-Status — bewusst ungekürzt, damit du selbst beurteilen kannst, ob ein Setup statistisch fragil ist.</p>
      </div>
    ),
  },
  {
    id: 'search',
    title: 'Die zwei Suchmodi',
    content: (
      <div className="space-y-3">
        <p>Über dem Karten-Grid findest du einen Toggle <strong>[Strategie | Aktie]</strong> mit Suchfeld:</p>
        <dl className="space-y-2.5">
          <div>
            <dt className="font-semibold text-slate-200">Strategie-Suche (Default)</dt>
            <dd>Filtert die Karten nach Titel und Tagline. Beispiel: „etf" → nur die ETF-Karte bleibt.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-200">Aktien-Suche</dt>
            <dd>Cross-Screening-Modus: Suche nach einer Aktie und siehe, in welchen Strategien sie aktuell auftaucht. Karten ohne Treffer werden ausgegraut, Karten mit Treffer bekommen einen cyanfarbigen Badge mit Trade-Anzahl. Klick auf eine markierte Karte öffnet die Detailseite mit vorbelegtem Aktienfilter.</dd>
          </div>
        </dl>
        <p>Beispiele: „tesla" zeigt 9 Trades in 1 Screening — „micron" zeigt Treffer quer durch mehrere Screenings.</p>
      </div>
    ),
  },
  {
    id: 'detail',
    title: 'Die Detail-Ansicht',
    content: (
      <div className="space-y-3">
        <p>Beim Klick auf eine Karte öffnet sich die Detail-Ansicht mit drei Bereichen:</p>
        <dl className="space-y-2.5">
          <div>
            <dt className="font-semibold text-slate-200">Filter-Pillen</dt>
            <dd>Die kuratierten Filterkriterien des Screenings, gruppiert in <span className="text-emerald-300">Optionen</span> / <span className="text-cyan-300">Technik</span> / <span className="text-amber-300">Fundamental</span>. Du siehst auf einen Blick, woran das Screening glaubt und worauf es filtert.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-200">Ergebnistabelle</dt>
            <dd>Alle gefundenen Optionsserien. Standard-Sortierung nach Rendite p.a. absteigend. Klick auf einen Spaltentitel ändert die Sortierung.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-200">Earnings-Status</dt>
            <dd>
              <span className="text-emerald-400 font-semibold uppercase text-[10px] tracking-wider">vor</span> = die Option verfällt <em>vor</em> dem nächsten Earnings-Termin (sicherer)<br/>
              <span className="text-rose-400 font-semibold uppercase text-[10px] tracking-wider">nach</span> = die Option läuft <em>über</em> Earnings (Gap-Risiko!)<br/>
              <span className="text-slate-500 uppercase text-[10px] tracking-wider">k.E.</span> = keine Earnings (typisch bei ETFs)
            </dd>
          </div>
        </dl>
      </div>
    ),
  },
  {
    id: 'table-controls',
    title: 'Die Tabellen-Steuerung',
    content: (
      <div className="space-y-3">
        <p>Über der Tabelle stehen drei Bedien-Elemente:</p>
        <dl className="space-y-2.5">
          <div>
            <dt className="font-semibold text-slate-200">Pro Aktie / Flach</dt>
            <dd><strong>Pro Aktie</strong> (Default): mehrere Setups derselben Aktie werden zu einer Zeile zusammengefasst — der beste Trade ist sichtbar, weitere klappen mit Klick auf die Zeile auf. <strong>Flach</strong>: jede Optionsserie als eigene Zeile.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-200"><span className="font-mono">+ Details</span> / <span className="font-mono">− Details</span></dt>
            <dd>Blendet vier zusätzliche Spalten ein: <strong>Kurs</strong>, <strong>IV</strong>, <strong>IV-Rank</strong>, <strong>Δ Strike</strong>. Standardansicht beschränkt sich auf die sieben wichtigsten Spalten (Name, Art, Strike, Verfall, Prämie, Rendite p.a., Earnings) — der Details-Toggle ist die Eingangstür zur Power-User-Ansicht.</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-200">Earnings-Risiko aus</dt>
            <dd>Filtert alle Zeilen aus, deren Verfall <em>nach</em> dem nächsten Earnings-Termin liegt. Für konservative Stillhalter, die kein Gap-Risiko wollen.</dd>
          </div>
        </dl>
        <p>Hast du auf der Hauptseite im <strong>Aktien-Modus</strong> nach einer bestimmten Aktie gesucht und dann eine Karte geöffnet, erscheint links neben den Bedien-Elementen eine Pille <span className="inline-block px-2 py-0.5 bg-cyan-500/10 border border-cyan-700/30 text-cyan-300 rounded text-xs">Aktie: Tesla ×</span>. Klick auf das ×, um den Filter zu entfernen und alle Treffer des Screenings zu sehen.</p>
      </div>
    ),
  },
  {
    id: 'cross-tool',
    title: 'Verbindung zu den anderen Tools',
    content: (
      <div className="space-y-3">
        <p>Der Screenings-Tab ist die <strong>Eingangstür</strong> in die anderen Optionshub-Tools:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Klick auf eine Tabellenzeile (in Production) öffnet den <strong>Strategy Builder</strong> mit vorbelegtem Ticker, Strike, Verfall und Bid/Ask</li>
          <li>Für deep ITM Call-Setups: direkter Sprung in den <strong>LEAP Calculator</strong> mit den passenden Parametern</li>
          <li>Für einzelne Position: <strong>Options Calculator</strong> für volle Greeks-Analyse</li>
        </ul>
        <p>So findest du in den Screenings eine interessante Position und analysierst sie sofort weiter, ohne Werte abzuschreiben.</p>
      </div>
    ),
  },
  {
    id: 'limits',
    title: 'Grenzen & Risikohinweis',
    content: (
      <div className="space-y-3">
        <p>Wichtig zu wissen:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Die Screenings sind <strong>Snapshots</strong> — Optionspreise und IV-Werte können sich innerhalb von Minuten ändern. Vor jedem Trade aktuelle Marktdaten prüfen.</li>
          <li>Annualisierte Renditen aus sehr kurzen Laufzeiten (5 Tage) können dreistellig erscheinen, sind aber statistisch fragil — sie projizieren eine Kurzfrist-Prämie aufs ganze Jahr hoch. Wir zeigen die ungekürzten Werte, damit du selbst einordnen kannst, was realistisch ist.</li>
          <li>Der <strong>Strike-Abstand</strong> ist ein Risikoindikator, kein Garant: bei plötzlichen Kursbewegungen kann auch ein weit OTM stehender Strike erreicht werden.</li>
          <li><strong>Naked Calls</strong> haben theoretisch unbegrenztes Verlustpotenzial — nur für erfahrene Trader mit entsprechender Margin und Risikomanagement.</li>
          <li>Kommissionen, Spread und Steuern sind nicht in den Renditen enthalten.</li>
        </ul>
        <p className="text-slate-500 text-xs italic">Optionshub liefert Werkzeuge, keine Anlageempfehlungen. Jeder Trade ist deine eigene Entscheidung.</p>
      </div>
    ),
  },
];

// =============================================================================
// === SCREENING CARD (Overview) ===============================================
// =============================================================================
function ScreeningCard({ s, onOpen, stockMatch, dimmed }) {
  const a = accentOf(s.accent);
  const data = SCREENING_DATA.get(s.id);
  return (
    <button
      onClick={() => onOpen(s.id)}
      className={`group relative text-left bg-slate-900/60 backdrop-blur rounded-xl border p-4 sm:p-5 pl-5 sm:pl-6 transition-all duration-150 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 ${
        stockMatch
          ? 'border-cyan-700/50 hover:-translate-y-0.5'
          : dimmed
            ? 'border-slate-800/60 opacity-40 hover:opacity-70'
            : 'border-slate-800 hover:-translate-y-0.5'
      }`}
    >
      <span className={`absolute left-0 top-4 bottom-4 w-0.5 sm:w-[3px] rounded-r ${a.dot} ${
        stockMatch ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'
      } transition-opacity`} />
      <h3 className="font-bold text-slate-100 text-[15px] sm:text-base leading-snug mb-1.5">{s.title}</h3>
      <p className="text-xs text-slate-500 leading-snug mb-4 min-h-[2.25rem]">{s.tagline}</p>

      {/* Stock match badge */}
      {stockMatch && (
        <div className="mb-3 -mx-1 px-2 py-1.5 rounded bg-cyan-500/10 border border-cyan-700/30 flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-wider text-cyan-300 font-semibold">
            {stockMatch.count} {stockMatch.count === 1 ? 'Trade' : 'Trades'}
          </span>
          <span className="font-mono text-xs text-cyan-200 tabular-nums">
            Beste: {fmtPct(stockMatch.bestReturn, 1)}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/60">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Treffer</div>
          <div className={`font-mono text-xl ${a.text} font-semibold tabular-nums`}>{data._count}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Ø Strike-Abstand</div>
          <div className="font-mono text-xl text-slate-200 tabular-nums">{fmtPct(data._buffer, 1)}</div>
        </div>
      </div>
    </button>
  );
}

// =============================================================================
// === OVERVIEW (Slim Header + Card Grid) ======================================
// =============================================================================
function ScreeningsOverview({ onOpen }) {
  const [mode, setMode] = useState('screening'); // 'screening' | 'stock'
  const [query, setQuery] = useState('');

  const totalHits = SCREENINGS_SORTED.reduce((sum, s) => sum + SCREENING_DATA.get(s.id)._count, 0);

  // Compute per-screening stock matches when in stock mode
  const stockMatches = useMemo(() => {
    if (mode !== 'stock' || !query.trim()) return new Map();
    const q = query.toLowerCase().trim();
    const m = new Map();
    for (const s of SCREENINGS_SORTED) {
      const hits = s.results.filter((r) =>
        r.name !== 'keine Treffer' && r.name.toLowerCase().includes(q)
      );
      if (hits.length > 0) {
        m.set(s.id, {
          count: hits.length,
          bestReturn: Math.max(...hits.map((r) => r.annualReturn)),
        });
      }
    }
    return m;
  }, [mode, query]);

  // Total stock hits across all screenings (for stats line)
  const stockTotalHits = useMemo(() => {
    if (mode !== 'stock' || !query.trim()) return null;
    let total = 0, screeningsWithHits = 0;
    for (const [, v] of stockMatches) {
      total += v.count;
      screeningsWithHits++;
    }
    return { total, screeningsWithHits };
  }, [stockMatches, mode, query]);

  // Filter cards: screening mode hides non-matches; stock mode dims non-matches
  const visible = SCREENINGS_SORTED.filter((s) => {
    if (mode === 'screening' && query) {
      return `${s.title} ${s.tagline}`.toLowerCase().includes(query.toLowerCase());
    }
    return true;
  });

  // When user clicks a card while in stock-search mode, pass the search term along
  const handleOpen = (id) => onOpen(id, mode === 'stock' && query.trim() ? query.trim() : '');

  return (
    <>
      {/* Slim header — stats + search controls */}
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-4 sm:mb-5 px-1">
        <div className="text-slate-400 text-xs sm:text-sm">
          {stockTotalHits ? (
            <>
              <span className="text-cyan-300 font-medium">„{query}"</span>
              <span className="text-slate-600 mx-2">·</span>
              <span className="font-mono text-cyan-300 tabular-nums">{stockTotalHits.total}</span> Trades in <span className="font-mono text-cyan-300 tabular-nums">{stockTotalHits.screeningsWithHits}</span> {stockTotalHits.screeningsWithHits === 1 ? 'Screening' : 'Screenings'}
              <span className="text-slate-600 mx-2">·</span>
              <span className="text-slate-500">{standLabel()}</span>
            </>
          ) : (
            <>
              <span className="text-slate-200 font-medium">{SCREENINGS_SORTED.length} Screenings</span>
              <span className="text-slate-600 mx-2">·</span>
              <span className="font-mono text-cyan-300 tabular-nums">{totalHits}</span> Treffer
              <span className="text-slate-600 mx-2">·</span>
              <span className="text-slate-500">{standLabel()}</span>
            </>
          )}
        </div>

        <div className="flex items-stretch gap-2 w-full sm:w-auto">
          <div className="flex bg-slate-950 rounded border border-slate-800 p-0.5 shrink-0">
            <button
              onClick={() => { setMode('screening'); }}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-wider rounded transition-colors ${
                mode === 'screening' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Suche in Screening-Namen"
            >Strategie</button>
            <button
              onClick={() => { setMode('stock'); }}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-wider rounded transition-colors ${
                mode === 'stock' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Suche in Aktiennamen quer durch alle Screenings"
            >Aktie</button>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === 'stock' ? 'Aktie suchen…' : 'Strategie suchen…'}
            className="bg-slate-950 text-slate-200 text-sm px-3 py-1.5 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none flex-1 sm:w-44"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {visible.map((s) => {
          const match = stockMatches.get(s.id);
          const dimmed = mode === 'stock' && query.trim() && !match;
          return (
            <ScreeningCard
              key={s.id}
              s={s}
              onOpen={handleOpen}
              stockMatch={match}
              dimmed={dimmed}
            />
          );
        })}
      </div>

      {mode === 'screening' && visible.length === 0 && (
        <div className="text-center py-12 text-slate-500">Keine Screenings für „{query}".</div>
      )}
      {mode === 'stock' && query.trim() && stockMatches.size === 0 && (
        <div className="text-center py-12 text-slate-500">
          „{query}" ist aktuell in keinem Screening enthalten.
        </div>
      )}
    </>
  );
}

// =============================================================================
// === FILTER PILLS ============================================================
// =============================================================================
function FilterPills({ filters }) {
  const groups = [
    { key: 'options', label: 'Optionen', accent: 'emerald' },
    { key: 'technical', label: 'Technik', accent: 'cyan' },
    { key: 'fundamental', label: 'Fundamental', accent: 'amber' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
      {groups.map(({ key, label, accent }) => {
        const items = (filters[key] || []).filter(x => x && x !== 'keine');
        const a = accentOf(accent);
        return (
          <div key={key} className="bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-4">
            <h3 className={`text-[10px] uppercase tracking-[0.2em] ${a.text} font-semibold mb-2.5 flex items-center gap-1.5`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${a.dot}`} />
              {label}
            </h3>
            {items.length === 0 ? (
              <div className="text-xs text-slate-600 italic">keine</div>
            ) : (
              <ul className="space-y-1.5">
                {items.map((item, i) => (
                  <li key={i} className="text-xs text-slate-300 leading-snug pl-3 relative">
                    <span className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-slate-600" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// === RESULTS TABLE — desktop columns + mobile cards + per-stock aggregation ==
// =============================================================================
const COLUMNS_DEFAULT = [
  { key: 'name',         label: 'Name',     align: 'left',  sortable: true,  always: true,  width: '' },
  { key: 'type',         label: 'Art',      align: 'center', sortable: true, always: true,  width: 'w-14' },
  { key: 'strike',       label: 'Strike',   align: 'right', sortable: true,  always: true,  width: 'w-20' },
  { key: 'expiry',       label: 'Verfall',  align: 'right', sortable: true,  always: true,  width: 'w-20' },
  { key: 'optionPrice',  label: 'Prämie',   align: 'right', sortable: true,  always: true,  width: 'w-16' },
  { key: 'annualReturn', label: 'Rendite p.a.', align: 'right', sortable: true, always: true, width: 'w-24' },
  { key: 'endsBeforeEarnings', label: 'Earnings', align: 'center', sortable: false, always: true, width: 'w-20' },
];
const COLUMNS_EXTENDED = [
  { key: 'price',      label: 'Kurs',     align: 'right', sortable: true, width: 'w-20' },
  { key: 'iv',         label: 'IV',       align: 'right', sortable: true, width: 'w-16' },
  { key: 'ivRank',     label: 'IV-Rank',  align: 'right', sortable: true, width: 'w-20' },
  { key: 'strikeDist', label: 'Δ Strike', align: 'right', sortable: true, width: 'w-20' },
];

const renderCell = (col, r) => {
  switch (col.key) {
    case 'name': return <span className="font-sans text-slate-200 font-medium">{r.name}</span>;
    case 'price': return <span className="tabular-nums text-slate-300">{fmt$(r.price)}</span>;
    case 'iv': return <span className="tabular-nums text-slate-400">{fmtPct(r.iv, 1)}</span>;
    case 'ivRank': {
      const high = r.ivRank >= 0.5;
      return <span className={`tabular-nums ${high ? 'text-amber-300' : 'text-slate-400'}`}>{fmtPct(r.ivRank, 0)}</span>;
    }
    case 'type':
      return <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
        r.type === 'Put' ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-300'
      }`}>{r.type}</span>;
    case 'strike': return <span className="tabular-nums text-slate-300">{fmt$(r.strike)}</span>;
    case 'strikeDist': return <span className="tabular-nums text-slate-400">{fmtPct(r.strikeDist, 1)}</span>;
    case 'expiry': return <span className="tabular-nums text-slate-300">{fmtDate(r.expiry)}</span>;
    case 'optionPrice': return <span className="tabular-nums text-slate-200">{fmt$(r.optionPrice)}</span>;
    case 'annualReturn': {
      const high = r.annualReturn >= 0.5;
      return <span className={`font-semibold tabular-nums ${high ? 'text-emerald-300' : 'text-slate-200'}`}>{fmtPct(r.annualReturn, 1)}</span>;
    }
    case 'endsBeforeEarnings':
      if (r.endsBeforeEarnings === 'Yes') return <span className="text-emerald-400 text-[10px] uppercase font-semibold tracking-wider">vor</span>;
      if (r.endsBeforeEarnings === 'No') return <span className="text-rose-400 text-[10px] uppercase font-semibold tracking-wider">nach</span>;
      return <span className="text-slate-600 text-[10px]">k.E.</span>;
    default: return '—';
  }
};

function ResultsTable({ results, initialSearch = '' }) {
  const groups = useMemo(() => groupByStock(results), [results]);
  const validResults = useMemo(() => results.filter(r => r.name !== 'keine Treffer'), [results]);

  const [sortKey, setSortKey] = useState('annualReturn');
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState(initialSearch);
  const [hideEarningsRisk, setHideEarningsRisk] = useState(false);
  const [showExtended, setShowExtended] = useState(false);
  const [aggregate, setAggregate] = useState(true);
  const [expanded, setExpanded] = useState(new Set());

  const cols = useMemo(() => showExtended ? [...COLUMNS_DEFAULT, ...COLUMNS_EXTENDED] : COLUMNS_DEFAULT, [showExtended]);

  const filteredGroups = useMemo(() => {
    let g = groups;
    if (search) {
      const q = search.toLowerCase();
      g = g.filter(grp => grp.name.toLowerCase().includes(q));
    }
    if (hideEarningsRisk) {
      g = g.map(grp => ({
        ...grp,
        rows: grp.rows.filter(r => r.endsBeforeEarnings !== 'No'),
      })).filter(grp => grp.rows.length > 0)
        .map(grp => ({ ...grp, lead: grp.rows[0], count: grp.rows.length }));
    }
    // Sort groups by their lead row's sortKey
    const dir = sortDir === 'asc' ? 1 : -1;
    g = [...g].sort((a, b) => {
      const av = a.lead[sortKey];
      const bv = b.lead[sortKey];
      if (typeof av === 'string') return dir * av.localeCompare(bv);
      return dir * (av - bv);
    });
    return g;
  }, [groups, search, hideEarningsRisk, sortKey, sortDir]);

  // Flat sorted rows (for non-aggregated view)
  const flatRows = useMemo(() => {
    let r = filteredGroups.flatMap(g => g.rows);
    return r;
  }, [filteredGroups]);

  const setSort = (k) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
  };

  const toggleExpand = (name) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const totalRows = filteredGroups.reduce((s, g) => s + g.rows.length, 0);

  if (validResults.length === 0) {
    return (
      <section className="bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-12 text-center">
        <div className="text-slate-400 mb-1">Keine Treffer</div>
        <div className="text-xs text-slate-600">Dieses Screening hat aktuell keine passenden Positionen gefunden.</div>
      </section>
    );
  }

  return (
    <section className="bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 overflow-hidden">
      {/* Controls header */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 sm:gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h2 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-semibold">
            Ergebnisse
            <span className="ml-2 normal-case tracking-normal text-slate-500 font-normal text-xs">
              {aggregate ? `${filteredGroups.length} Aktien · ${totalRows} Positionen` : `${totalRows} Positionen`}
            </span>
          </h2>
          {search && (
            <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-700/30 text-cyan-300 text-[10px] uppercase tracking-wider px-2 py-1 rounded">
              <span className="text-slate-500 normal-case tracking-normal">Aktie:</span>
              <span className="font-mono normal-case tracking-normal">{search}</span>
              <button
                onClick={() => setSearch('')}
                className="ml-1 text-cyan-400 hover:text-cyan-200 text-sm leading-none -my-1 px-1"
                aria-label="Filter zurücksetzen"
                title="Aktien-Filter zurücksetzen"
              >×</button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-950 rounded border border-slate-800 p-0.5">
            <button
              onClick={() => setAggregate(true)}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-wider rounded transition-colors ${
                aggregate ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >Pro Aktie</button>
            <button
              onClick={() => setAggregate(false)}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-wider rounded transition-colors ${
                !aggregate ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >Flach</button>
          </div>
          <button
            onClick={() => setShowExtended(v => !v)}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider rounded border transition-colors inline-flex items-center gap-1.5 ${
              showExtended ? 'bg-cyan-500/15 text-cyan-300 border-cyan-700/40' : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title={showExtended ? 'Kurs, IV, IV-Rank, Δ Strike ausblenden' : 'Kurs, IV, IV-Rank, Δ Strike einblenden'}
          >
            <span className="font-mono text-xs">{showExtended ? '−' : '+'}</span>
            Details
          </button>
          <button
            onClick={() => setHideEarningsRisk(v => !v)}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider rounded border transition-colors ${
              hideEarningsRisk ? 'bg-emerald-500/15 text-emerald-300 border-emerald-700/40' : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >Earnings-Risiko aus</button>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-950/60 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              {aggregate && <th className="w-8"></th>}
              {cols.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && setSort(col.key)}
                  className={`py-2 px-3 font-medium text-${col.align} ${col.width} ${
                    col.sortable ? 'cursor-pointer hover:text-cyan-300 select-none' : ''
                  } ${sortKey === col.key ? 'text-cyan-300' : ''}`}
                >
                  {col.label}{col.sortable && sortKey === col.key && (sortDir === 'asc' ? ' ▲' : ' ▼')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {aggregate ? (
              filteredGroups.slice(0, 100).map((g, gi) => {
                const isOpen = expanded.has(g.name);
                return (
                  <React.Fragment key={g.name}>
                    {/* Lead row */}
                    <tr
                      className="border-t border-slate-800/60 hover:bg-slate-800/30 cursor-pointer transition-colors"
                      onClick={() => g.count > 1 && toggleExpand(g.name)}
                    >
                      <td className="text-center text-slate-500">
                        {g.count > 1 ? <span className="text-cyan-500/70">{isOpen ? '▼' : '▶'}</span> : null}
                      </td>
                      {cols.map(col => (
                        <td key={col.key} className={`py-2 px-3 text-${col.align}`}>
                          {col.key === 'name' ? (
                            <span>
                              {renderCell(col, g.lead)}
                              {g.count > 1 && (
                                <span className="ml-2 text-[10px] text-slate-500 font-mono">+{g.count - 1}</span>
                              )}
                            </span>
                          ) : renderCell(col, g.lead)}
                        </td>
                      ))}
                    </tr>
                    {/* Expanded sub-rows */}
                    {isOpen && g.rows.slice(1).map((r, ri) => (
                      <tr key={ri} className="bg-slate-950/40 border-t border-slate-800/40">
                        <td></td>
                        {cols.map(col => (
                          <td key={col.key} className={`py-1.5 px-3 text-${col.align} pl-${col.key === 'name' ? '7' : '3'}`}>
                            {col.key === 'name' ? (
                              <span className="text-slate-500 text-xs italic">↳ alternative</span>
                            ) : renderCell(col, r)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            ) : (
              flatRows.slice(0, 200).map((r, i) => (
                <tr key={i} className="border-t border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                  {cols.map(col => (
                    <td key={col.key} className={`py-2 px-3 text-${col.align}`}>
                      {renderCell(col, r)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {((aggregate && filteredGroups.length > 100) || (!aggregate && flatRows.length > 200)) && (
          <div className="px-5 py-3 border-t border-slate-800 text-xs text-slate-500 text-center">
            … weitere ausgeblendet — verfeinere die Suche
          </div>
        )}
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden divide-y divide-slate-800/60">
        {aggregate ? (
          filteredGroups.slice(0, 60).map((g) => {
            const isOpen = expanded.has(g.name);
            return (
              <div key={g.name}>
                <button
                  onClick={() => g.count > 1 && toggleExpand(g.name)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-800/30 active:bg-slate-800/50 transition-colors"
                >
                  <MobileRow r={g.lead} count={g.count} isOpen={isOpen} showExtended={showExtended} />
                </button>
                {isOpen && g.rows.slice(1).map((r, ri) => (
                  <div key={ri} className="px-4 py-3 bg-slate-950/40 border-t border-slate-800/40 pl-8">
                    <MobileRow r={r} count={1} isOpen={false} hideExpander showExtended={showExtended} />
                  </div>
                ))}
              </div>
            );
          })
        ) : (
          flatRows.slice(0, 80).map((r, i) => (
            <div key={i} className="px-4 py-3">
              <MobileRow r={r} count={1} isOpen={false} hideExpander showExtended={showExtended} />
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-slate-800 text-[11px] text-slate-500 italic flex items-center gap-4 flex-wrap">
        <span><span className="text-emerald-400 font-semibold uppercase tracking-wider not-italic">vor</span> = Verfall vor Earnings</span>
        <span><span className="text-rose-400 font-semibold uppercase tracking-wider not-italic">nach</span> = Earnings-Risiko</span>
        <span className="hidden sm:inline"><span className="text-amber-300 not-italic">IV-Rank ≥ 50 %</span> hervorgehoben</span>
        <span className="hidden sm:inline"><span className="text-emerald-300 not-italic">Rendite ≥ 50 %</span> hervorgehoben</span>
      </div>
    </section>
  );
}

// MobileRow: compact card layout for one position
function MobileRow({ r, count, isOpen, hideExpander, showExtended }) {
  const high = r.annualReturn >= 0.5;
  const highIvRank = r.ivRank >= 0.5;
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {!hideExpander && count > 1 && (
              <span className="text-cyan-500/70 text-xs">{isOpen ? '▼' : '▶'}</span>
            )}
            <span className="text-slate-100 text-sm font-semibold truncate">{r.name}</span>
            {count > 1 && <span className="text-[10px] text-slate-500 font-mono shrink-0">+{count - 1}</span>}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
              r.type === 'Put' ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-300'
            }`}>{r.type}</span>
            <span>{fmt$(r.strike)}</span>
            <span className="text-slate-600">·</span>
            <span>{fmtDate(r.expiry)}</span>
            <span className="text-slate-600">·</span>
            <span>{fmt$(r.optionPrice)}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`font-mono text-base font-semibold tabular-nums ${high ? 'text-emerald-300' : 'text-slate-200'}`}>
            {fmtPct(r.annualReturn, 1)}
          </div>
          <div className="text-[9px] uppercase tracking-wider mt-0.5">
            {r.endsBeforeEarnings === 'Yes' && <span className="text-emerald-400 font-semibold">vor Earn.</span>}
            {r.endsBeforeEarnings === 'No' && <span className="text-rose-400 font-semibold">nach Earn.</span>}
            {r.endsBeforeEarnings === 'N/A' && <span className="text-slate-600">k.E.</span>}
          </div>
        </div>
      </div>

      {/* Extended details (only when toggle active) */}
      {showExtended && (
        <div className="mt-2 pt-2 border-t border-slate-800/40 grid grid-cols-4 gap-2 text-[10px] font-mono">
          <div>
            <div className="uppercase tracking-wider text-slate-600 mb-0.5">Kurs</div>
            <div className="text-slate-300 tabular-nums">{fmt$(r.price)}</div>
          </div>
          <div>
            <div className="uppercase tracking-wider text-slate-600 mb-0.5">IV</div>
            <div className="text-slate-400 tabular-nums">{fmtPct(r.iv, 1)}</div>
          </div>
          <div>
            <div className="uppercase tracking-wider text-slate-600 mb-0.5">IV-Rank</div>
            <div className={`tabular-nums ${highIvRank ? 'text-amber-300' : 'text-slate-400'}`}>{fmtPct(r.ivRank, 0)}</div>
          </div>
          <div>
            <div className="uppercase tracking-wider text-slate-600 mb-0.5">Δ Strike</div>
            <div className="text-slate-400 tabular-nums">{fmtPct(r.strikeDist, 1)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// === DETAIL VIEW =============================================================
// =============================================================================
function ScreeningDetail({ id, onBack, initialStockSearch = '' }) {
  const s = SCREENINGS.find(x => x.id === id);
  if (!s) return <div className="text-slate-500">Screening „{id}" nicht gefunden.</div>;
  const a = accentOf(s.accent);
  const data = SCREENING_DATA.get(s.id);

  return (
    <>
      {/* Detail header — only Treffer + Strike-Abstand */}
      <div className="relative bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-4 sm:p-5 pl-5 sm:pl-6 mb-4 sm:mb-5 overflow-hidden">
        <span className={`absolute left-0 top-5 bottom-5 w-0.5 sm:w-[3px] rounded-r ${a.dot} opacity-70`} />
        <button
          onClick={onBack}
          className="text-xs text-slate-500 hover:text-cyan-300 mb-3 flex items-center gap-1 transition-colors min-h-[24px]"
        >
          ← Zurück
        </button>
        <div className="flex items-start gap-3 sm:gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug mb-1">{s.title}</h2>
            <p className="text-xs sm:text-sm text-slate-500">{s.tagline}</p>
          </div>
          <div className="flex gap-5 sm:gap-8 text-right shrink-0">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Treffer</div>
              <div className={`font-mono text-xl sm:text-2xl ${a.text} font-bold tabular-nums`}>{data._count}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Ø Strike-Abstand</div>
              <div className="font-mono text-xl sm:text-2xl text-slate-100 font-bold tabular-nums">{fmtPct(data._buffer, 1)}</div>
            </div>
          </div>
        </div>
      </div>

      <FilterPills filters={s.filters} />
      <ResultsTable results={s.results} initialSearch={initialStockSearch} />

      <div className="mt-4 text-[11px] text-slate-500 italic px-1">
        Hinweis: In Production öffnet ein Klick auf eine Zeile die Position im Strategy Builder oder LEAP Calculator mit vorbelegten Werten.
      </div>
    </>
  );
}

// =============================================================================

// =============================================================================
// === DEFAULT EXPORT — top-level Screenings tab component =====================
// =============================================================================
export default function Screenings() {
  const [openId, setOpenId] = useState(null);
  const [openSearch, setOpenSearch] = useState('');
  const [, setDataVersion] = useState(0);

  // Live-Daten laden (nächtlich aktualisierte screenings.json). Erfolgt der
  // Fetch nicht, bleibt der eingebackene Snapshot stehen.
  useEffect(() => {
    let cancelled = false;
    fetch(SCREENINGS_JSON_URL, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(live => {
        if (cancelled || !live) return;
        if (applyLiveData(live)) setDataVersion(v => v + 1);
      })
      .catch(() => { /* offline / kein File -> Fallback-Snapshot */ });
    return () => { cancelled = true; };
  }, []);

  const handleOpen = (id, stockSearch = '') => {
    setOpenId(id);
    setOpenSearch(stockSearch);
    // Scroll back to top so the detail view starts from the top
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setOpenId(null);
    setOpenSearch('');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (openId) {
    return <ScreeningDetail id={openId} onBack={handleBack} initialStockSearch={openSearch} />;
  }
  return <ScreeningsOverview onOpen={handleOpen} />;
}

// Named export for the host App.jsx help-drawer
export const HELP_SECTIONS = SCREENINGS_HELP;
