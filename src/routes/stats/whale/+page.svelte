<script lang="ts">
  // import { format, PeriodType } from '@layerstack/utils'
  import { PeriodType } from '@layerstack/utils'
  import { Area, AreaChart, Brush, LinearGradient, Tooltip } from 'layerchart'
  import { fade } from 'svelte/transition'

  import og from '$lib/assets/og-whale.png'
  import Avatar from '$lib/components/Avatar.svelte'
  import Og from '$lib/components/Og.svelte'
  import { type LatestGlobalStats } from '$modules/at/AtController'

  const description = 'Global statistics on Bluesky usage'

  const { data }: { data: LatestGlobalStats | null } = $props()

  const staticStats = $state([
    { $count: 6, onDay: '2022-11-17' },
    { $count: 10, onDay: '2022-11-18' },
    { $count: 3, onDay: '2022-11-22' },
    { $count: 5, onDay: '2022-11-23' },
    { $count: 3, onDay: '2022-11-24' },
    { $count: 1, onDay: '2022-11-25' },
    { $count: 2, onDay: '2022-11-26' },
    { $count: 1, onDay: '2022-11-28' },
    { $count: 3, onDay: '2022-11-29' },
    { $count: 11, onDay: '2022-11-30' },
    { $count: 2, onDay: '2022-12-01' },
    { $count: 1, onDay: '2022-12-03' },
    { $count: 1, onDay: '2022-12-06' },
    { $count: 10, onDay: '2022-12-07' },
    { $count: 1, onDay: '2022-12-11' },
    { $count: 1, onDay: '2022-12-13' },
    { $count: 3, onDay: '2022-12-14' },
    { $count: 4, onDay: '2022-12-15' },
    { $count: 3, onDay: '2022-12-16' },
    { $count: 2, onDay: '2022-12-17' },
    { $count: 5, onDay: '2022-12-18' },
    { $count: 1, onDay: '2022-12-19' },
    { $count: 1, onDay: '2022-12-24' },
    { $count: 1, onDay: '2022-12-26' },
    { $count: 1, onDay: '2022-12-28' },
    { $count: 2, onDay: '2023-01-02' },
    { $count: 9, onDay: '2023-01-04' },
    { $count: 3, onDay: '2023-01-05' },
    { $count: 1, onDay: '2023-01-06' },
    { $count: 1, onDay: '2023-01-08' },
    { $count: 1, onDay: '2023-01-13' },
    { $count: 1, onDay: '2023-01-15' },
    { $count: 3, onDay: '2023-01-16' },
    { $count: 4, onDay: '2023-01-17' },
    { $count: 7, onDay: '2023-01-18' },
    { $count: 12, onDay: '2023-01-19' },
    { $count: 8, onDay: '2023-01-20' },
    { $count: 14, onDay: '2023-01-21' },
    { $count: 5, onDay: '2023-01-22' },
    { $count: 9, onDay: '2023-01-23' },
    { $count: 12, onDay: '2023-01-24' },
    { $count: 12, onDay: '2023-01-25' },
    { $count: 9, onDay: '2023-01-26' },
    { $count: 5, onDay: '2023-01-27' },
    { $count: 10, onDay: '2023-01-28' },
    { $count: 9, onDay: '2023-01-29' },
    { $count: 2, onDay: '2023-01-30' },
    { $count: 4, onDay: '2023-01-31' },
    { $count: 4, onDay: '2023-02-01' },
    { $count: 4, onDay: '2023-02-02' },
    { $count: 21, onDay: '2023-02-03' },
    { $count: 23, onDay: '2023-02-04' },
    { $count: 8, onDay: '2023-02-05' },
    { $count: 3, onDay: '2023-02-06' },
    { $count: 9, onDay: '2023-02-07' },
    { $count: 1, onDay: '2023-02-08' },
    { $count: 2, onDay: '2023-02-09' },
    { $count: 1, onDay: '2023-02-10' },
    { $count: 2, onDay: '2023-02-11' },
    { $count: 2, onDay: '2023-02-12' },
    { $count: 3, onDay: '2023-02-13' },
    { $count: 7, onDay: '2023-02-15' },
    { $count: 22, onDay: '2023-02-16' },
    { $count: 9, onDay: '2023-02-17' },
    { $count: 13, onDay: '2023-02-18' },
    { $count: 6, onDay: '2023-02-19' },
    { $count: 3, onDay: '2023-02-20' },
    { $count: 4, onDay: '2023-02-21' },
    { $count: 10, onDay: '2023-02-22' },
    { $count: 43, onDay: '2023-02-23' },
    { $count: 36, onDay: '2023-02-24' },
    { $count: 52, onDay: '2023-02-25' },
    { $count: 9, onDay: '2023-02-26' },
    { $count: 102, onDay: '2023-02-27' },
    { $count: 76, onDay: '2023-02-28' },
    { $count: 394, onDay: '2023-03-01' },
    { $count: 361, onDay: '2023-03-02' },
    { $count: 435, onDay: '2023-03-03' },
    { $count: 373, onDay: '2023-03-04' },
    { $count: 153, onDay: '2023-03-05' },
    { $count: 276, onDay: '2023-03-06' },
    { $count: 436, onDay: '2023-03-07' },
    { $count: 313, onDay: '2023-03-08' },
    { $count: 215, onDay: '2023-03-09' },
    { $count: 121, onDay: '2023-03-10' },
    { $count: 88, onDay: '2023-03-11' },
    { $count: 79, onDay: '2023-03-12' },
    { $count: 144, onDay: '2023-03-13' },
    { $count: 84, onDay: '2023-03-14' },
    { $count: 136, onDay: '2023-03-15' },
    { $count: 101, onDay: '2023-03-16' },
    { $count: 87, onDay: '2023-03-17' },
    { $count: 126, onDay: '2023-03-18' },
    { $count: 63, onDay: '2023-03-19' },
    { $count: 40, onDay: '2023-03-20' },
    { $count: 96, onDay: '2023-03-21' },
    { $count: 93, onDay: '2023-03-22' },
    { $count: 40, onDay: '2023-03-23' },
    { $count: 28, onDay: '2023-03-24' },
    { $count: 128, onDay: '2023-03-25' },
    { $count: 158, onDay: '2023-03-26' },
    { $count: 155, onDay: '2023-03-27' },
    { $count: 109, onDay: '2023-03-28' },
    { $count: 63, onDay: '2023-03-29' },
    { $count: 59, onDay: '2023-03-30' },
    { $count: 33, onDay: '2023-03-31' },
    { $count: 28, onDay: '2023-04-01' },
    { $count: 21, onDay: '2023-04-02' },
    { $count: 14, onDay: '2023-04-03' },
    { $count: 15, onDay: '2023-04-04' },
    { $count: 84, onDay: '2023-04-05' },
    { $count: 3012, onDay: '2023-04-06' },
    { $count: 1102, onDay: '2023-04-07' },
    { $count: 996, onDay: '2023-04-08' },
    { $count: 687, onDay: '2023-04-09' },
    { $count: 1290, onDay: '2023-04-10' },
    { $count: 4172, onDay: '2023-04-11' },
    { $count: 2217, onDay: '2023-04-12' },
    { $count: 1223, onDay: '2023-04-13' },
    { $count: 782, onDay: '2023-04-14' },
    { $count: 1592, onDay: '2023-04-15' },
    { $count: 496, onDay: '2023-04-16' },
    { $count: 560, onDay: '2023-04-17' },
    { $count: 1321, onDay: '2023-04-18' },
    { $count: 2307, onDay: '2023-04-19' },
    { $count: 2237, onDay: '2023-04-20' },
    { $count: 1961, onDay: '2023-04-21' },
    { $count: 1312, onDay: '2023-04-22' },
    { $count: 1411, onDay: '2023-04-23' },
    { $count: 2326, onDay: '2023-04-24' },
    { $count: 2623, onDay: '2023-04-25' },
    { $count: 2375, onDay: '2023-04-26' },
    { $count: 3945, onDay: '2023-04-27' },
    { $count: 2996, onDay: '2023-04-28' },
    { $count: 1652, onDay: '2023-04-29' },
    { $count: 1428, onDay: '2023-04-30' },
    { $count: 2145, onDay: '2023-05-01' },
    { $count: 2434, onDay: '2023-05-02' },
    { $count: 2492, onDay: '2023-05-03' },
    { $count: 2858, onDay: '2023-05-04' },
    { $count: 2333, onDay: '2023-05-05' },
    { $count: 1571, onDay: '2023-05-06' },
    { $count: 1130, onDay: '2023-05-07' },
    { $count: 1404, onDay: '2023-05-08' },
    { $count: 1721, onDay: '2023-05-09' },
    { $count: 1736, onDay: '2023-05-10' },
    { $count: 1639, onDay: '2023-05-11' },
    { $count: 2094, onDay: '2023-05-12' },
    { $count: 1642, onDay: '2023-05-13' },
    { $count: 1057, onDay: '2023-05-14' },
    { $count: 1648, onDay: '2023-05-15' },
    { $count: 1376, onDay: '2023-05-16' },
    { $count: 1319, onDay: '2023-05-17' },
    { $count: 1460, onDay: '2023-05-18' },
    { $count: 1314, onDay: '2023-05-19' },
    { $count: 1086, onDay: '2023-05-20' },
    { $count: 913, onDay: '2023-05-21' },
    { $count: 1065, onDay: '2023-05-22' },
    { $count: 1289, onDay: '2023-05-23' },
    { $count: 1636, onDay: '2023-05-24' },
    { $count: 1977, onDay: '2023-05-25' },
    { $count: 2081, onDay: '2023-05-26' },
    { $count: 1754, onDay: '2023-05-27' },
    { $count: 1548, onDay: '2023-05-28' },
    { $count: 1507, onDay: '2023-05-29' },
    { $count: 1757, onDay: '2023-05-30' },
    { $count: 1366, onDay: '2023-05-31' },
    { $count: 1335, onDay: '2023-06-01' },
    { $count: 1530, onDay: '2023-06-02' },
    { $count: 1155, onDay: '2023-06-03' },
    { $count: 1064, onDay: '2023-06-04' },
    { $count: 1266, onDay: '2023-06-05' },
    { $count: 1296, onDay: '2023-06-06' },
    { $count: 1850, onDay: '2023-06-07' },
    { $count: 1689, onDay: '2023-06-08' },
    { $count: 2183, onDay: '2023-06-09' },
    { $count: 2153, onDay: '2023-06-10' },
    { $count: 2195, onDay: '2023-06-11' },
    { $count: 2742, onDay: '2023-06-12' },
    { $count: 1822, onDay: '2023-06-13' },
    { $count: 3653, onDay: '2023-06-14' },
    { $count: 2947, onDay: '2023-06-15' },
    { $count: 2662, onDay: '2023-06-16' },
    { $count: 2222, onDay: '2023-06-17' },
    { $count: 1274, onDay: '2023-06-18' },
    { $count: 1375, onDay: '2023-06-19' },
    { $count: 1248, onDay: '2023-06-20' },
    { $count: 3537, onDay: '2023-06-21' },
    { $count: 10045, onDay: '2023-06-22' },
    { $count: 4192, onDay: '2023-06-23' },
    { $count: 2211, onDay: '2023-06-24' },
    { $count: 2035, onDay: '2023-06-25' },
    { $count: 2507, onDay: '2023-06-26' },
    { $count: 4963, onDay: '2023-06-27' },
    { $count: 5032, onDay: '2023-06-28' },
    { $count: 4709, onDay: '2023-06-29' },
    { $count: 5096, onDay: '2023-06-30' },
    { $count: 19211, onDay: '2023-07-01' },
    { $count: 38121, onDay: '2023-07-03' },
    { $count: 13093, onDay: '2023-07-04' },
    { $count: 8044, onDay: '2023-07-05' },
    { $count: 9682, onDay: '2023-07-06' },
    { $count: 7673, onDay: '2023-07-07' },
    { $count: 5232, onDay: '2023-07-08' },
    { $count: 3275, onDay: '2023-07-09' },
    { $count: 3725, onDay: '2023-07-10' },
    { $count: 3562, onDay: '2023-07-11' },
    { $count: 4790, onDay: '2023-07-12' },
    { $count: 5386, onDay: '2023-07-13' },
    { $count: 5018, onDay: '2023-07-14' },
    { $count: 3764, onDay: '2023-07-15' },
    { $count: 3585, onDay: '2023-07-16' },
    { $count: 4108, onDay: '2023-07-17' },
    { $count: 3731, onDay: '2023-07-18' },
    { $count: 3321, onDay: '2023-07-19' },
    { $count: 2989, onDay: '2023-07-20' },
    { $count: 4527, onDay: '2023-07-21' },
    { $count: 5015, onDay: '2023-07-22' },
    { $count: 7234, onDay: '2023-07-23' },
    { $count: 23258, onDay: '2023-07-24' },
    { $count: 15333, onDay: '2023-07-25' },
    { $count: 8668, onDay: '2023-07-26' },
    { $count: 10084, onDay: '2023-07-27' },
    { $count: 10101, onDay: '2023-07-28' },
    { $count: 9224, onDay: '2023-07-29' },
    { $count: 10035, onDay: '2023-07-30' },
    { $count: 8572, onDay: '2023-07-31' },
    { $count: 8079, onDay: '2023-08-01' },
    { $count: 7756, onDay: '2023-08-02' },
    { $count: 14779, onDay: '2023-08-03' },
    { $count: 14704, onDay: '2023-08-04' },
    { $count: 12083, onDay: '2023-08-05' },
    { $count: 12103, onDay: '2023-08-06' },
    { $count: 13598, onDay: '2023-08-07' },
    { $count: 10673, onDay: '2023-08-08' },
    { $count: 7477, onDay: '2023-08-09' },
    { $count: 6921, onDay: '2023-08-10' },
    { $count: 6785, onDay: '2023-08-11' },
    { $count: 6933, onDay: '2023-08-12' },
    { $count: 7920, onDay: '2023-08-13' },
    { $count: 10230, onDay: '2023-08-14' },
    { $count: 9727, onDay: '2023-08-15' },
    { $count: 10359, onDay: '2023-08-16' },
    { $count: 9753, onDay: '2023-08-17' },
    { $count: 29034, onDay: '2023-08-18' },
    { $count: 19079, onDay: '2023-08-19' },
    { $count: 11445, onDay: '2023-08-20' },
    { $count: 11596, onDay: '2023-08-21' },
    { $count: 10404, onDay: '2023-08-22' },
    { $count: 10656, onDay: '2023-08-23' },
    { $count: 20349, onDay: '2023-08-24' },
    { $count: 19660, onDay: '2023-08-25' },
    { $count: 15887, onDay: '2023-08-26' },
    { $count: 9454, onDay: '2023-08-27' },
    { $count: 10442, onDay: '2023-08-28' },
    { $count: 10985, onDay: '2023-08-29' },
    { $count: 19461, onDay: '2023-08-30' },
    { $count: 19418, onDay: '2023-08-31' },
    { $count: 18380, onDay: '2023-09-01' },
    { $count: 9880, onDay: '2023-09-02' },
    { $count: 10129, onDay: '2023-09-03' },
    { $count: 10830, onDay: '2023-09-04' },
    { $count: 11720, onDay: '2023-09-05' },
    { $count: 10874, onDay: '2023-09-06' },
    { $count: 16723, onDay: '2023-09-07' },
    { $count: 20461, onDay: '2023-09-08' },
    { $count: 19220, onDay: '2023-09-09' },
    { $count: 14389, onDay: '2023-09-10' },
    { $count: 12214, onDay: '2023-09-11' },
    { $count: 20200, onDay: '2023-09-12' },
    { $count: 15735, onDay: '2023-09-13' },
    { $count: 11127, onDay: '2023-09-14' },
    { $count: 9800, onDay: '2023-09-15' },
    { $count: 8352, onDay: '2023-09-16' },
    { $count: 8568, onDay: '2023-09-17' },
    { $count: 17350, onDay: '2023-09-18' },
    { $count: 53538, onDay: '2023-09-19' },
    { $count: 31738, onDay: '2023-09-20' },
    { $count: 22682, onDay: '2023-09-21' },
    { $count: 19079, onDay: '2023-09-22' },
    { $count: 13540, onDay: '2023-09-23' },
    { $count: 12659, onDay: '2023-09-24' },
    { $count: 13392, onDay: '2023-09-25' },
    { $count: 12354, onDay: '2023-09-26' },
    { $count: 11681, onDay: '2023-09-27' },
    { $count: 11616, onDay: '2023-09-28' },
    { $count: 21693, onDay: '2023-09-29' },
    { $count: 14769, onDay: '2023-09-30' },
    { $count: 15674, onDay: '2023-10-01' },
    { $count: 19540, onDay: '2023-10-02' },
    { $count: 18046, onDay: '2023-10-03' },
    { $count: 16011, onDay: '2023-10-04' },
    { $count: 15746, onDay: '2023-10-05' },
    { $count: 17315, onDay: '2023-10-06' },
    { $count: 14627, onDay: '2023-10-07' },
    { $count: 12929, onDay: '2023-10-08' },
    { $count: 14558, onDay: '2023-10-09' },
    { $count: 18449, onDay: '2023-10-10' },
    { $count: 18379, onDay: '2023-10-11' },
    { $count: 19437, onDay: '2023-10-12' },
    { $count: 20851, onDay: '2023-10-13' },
    { $count: 14627, onDay: '2023-10-14' },
    { $count: 13410, onDay: '2023-10-15' },
    { $count: 13899, onDay: '2023-10-16' },
    { $count: 12911, onDay: '2023-10-17' },
    { $count: 35154, onDay: '2023-10-18' },
    { $count: 28077, onDay: '2023-10-19' },
    { $count: 19909, onDay: '2023-10-20' },
    { $count: 15092, onDay: '2023-10-21' },
    { $count: 13686, onDay: '2023-10-22' },
    { $count: 15002, onDay: '2023-10-23' },
    { $count: 15552, onDay: '2023-10-24' },
    { $count: 13584, onDay: '2023-10-25' },
    { $count: 11957, onDay: '2023-10-26' },
    { $count: 11572, onDay: '2023-10-27' },
    { $count: 10926, onDay: '2023-10-28' },
    { $count: 13262, onDay: '2023-10-29' },
    { $count: 14087, onDay: '2023-10-30' },
    { $count: 12252, onDay: '2023-10-31' },
    { $count: 11706, onDay: '2023-11-01' },
    { $count: 13449, onDay: '2023-11-02' },
    { $count: 14145, onDay: '2023-11-03' },
    { $count: 12647, onDay: '2023-11-04' },
    { $count: 12913, onDay: '2023-11-05' },
    { $count: 14749, onDay: '2023-11-06' },
    { $count: 14325, onDay: '2023-11-07' },
    { $count: 12182, onDay: '2023-11-08' },
    { $count: 18381, onDay: '2023-11-09' },
    { $count: 18279, onDay: '2023-11-10' },
    { $count: 19969, onDay: '2023-11-11' },
    { $count: 20177, onDay: '2023-11-12' },
    { $count: 18444, onDay: '2023-11-13' },
    { $count: 10763, onDay: '2023-11-14' },
    { $count: 16362, onDay: '2023-11-15' },
    { $count: 16620, onDay: '2023-11-16' },
    { $count: 11533, onDay: '2023-11-17' },
    { $count: 19096, onDay: '2023-11-18' },
    { $count: 18560, onDay: '2023-11-19' },
    { $count: 20465, onDay: '2023-11-20' },
    { $count: 20709, onDay: '2023-11-21' },
    { $count: 13970, onDay: '2023-11-22' },
    { $count: 14806, onDay: '2023-11-23' },
    { $count: 16589, onDay: '2023-11-24' },
    { $count: 16254, onDay: '2023-11-25' },
    { $count: 13205, onDay: '2023-11-26' },
    { $count: 10391, onDay: '2023-11-27' },
    { $count: 23706, onDay: '2023-11-28' },
    { $count: 22977, onDay: '2023-11-29' },
    { $count: 12000, onDay: '2023-11-30' },
    { $count: 30921, onDay: '2023-12-01' },
    { $count: 22724, onDay: '2023-12-02' },
    { $count: 24723, onDay: '2023-12-03' },
    { $count: 24416, onDay: '2023-12-04' },
    { $count: 10042, onDay: '2023-12-05' },
    { $count: 20759, onDay: '2023-12-06' },
    { $count: 23089, onDay: '2023-12-07' },
    { $count: 22638, onDay: '2023-12-08' },
    { $count: 20439, onDay: '2023-12-09' },
    { $count: 9554, onDay: '2023-12-10' },
    { $count: 9490, onDay: '2023-12-11' },
    { $count: 7826, onDay: '2023-12-12' },
    { $count: 18955, onDay: '2023-12-13' },
    { $count: 9112, onDay: '2023-12-14' },
    { $count: 14900, onDay: '2023-12-15' },
    { $count: 17836, onDay: '2023-12-16' },
    { $count: 20167, onDay: '2023-12-17' },
    { $count: 22048, onDay: '2023-12-18' },
    { $count: 30692, onDay: '2023-12-19' },
    { $count: 17204, onDay: '2023-12-20' },
    { $count: 31674, onDay: '2023-12-21' },
    { $count: 18581, onDay: '2023-12-22' },
    { $count: 26176, onDay: '2023-12-23' },
    { $count: 21973, onDay: '2023-12-24' },
    { $count: 15963, onDay: '2023-12-25' },
    { $count: 19621, onDay: '2023-12-26' },
    { $count: 14131, onDay: '2023-12-27' },
    { $count: 13568, onDay: '2023-12-28' },
    { $count: 16760, onDay: '2023-12-29' },
    { $count: 19753, onDay: '2023-12-30' },
    { $count: 17995, onDay: '2023-12-31' },
    { $count: 20468, onDay: '2024-01-01' },
    { $count: 12532, onDay: '2024-01-02' },
    { $count: 13205, onDay: '2024-01-03' },
    { $count: 10310, onDay: '2024-01-04' },
    { $count: 8652, onDay: '2024-01-05' },
    { $count: 7130, onDay: '2024-01-06' },
    { $count: 19561, onDay: '2024-01-07' },
    { $count: 29844, onDay: '2024-01-08' },
    { $count: 18224, onDay: '2024-01-09' },
    { $count: 10630, onDay: '2024-01-10' },
    { $count: 7767, onDay: '2024-01-11' },
    { $count: 6277, onDay: '2024-01-12' },
    { $count: 5232, onDay: '2024-01-13' },
    { $count: 4912, onDay: '2024-01-14' },
    { $count: 4651, onDay: '2024-01-15' },
    { $count: 4549, onDay: '2024-01-16' },
    { $count: 4408, onDay: '2024-01-17' },
    { $count: 4718, onDay: '2024-01-18' },
    { $count: 4430, onDay: '2024-01-19' },
    { $count: 4309, onDay: '2024-01-20' },
    { $count: 4427, onDay: '2024-01-21' },
    { $count: 4335, onDay: '2024-01-22' },
    { $count: 3997, onDay: '2024-01-23' },
    { $count: 3461, onDay: '2024-01-24' },
    { $count: 3076, onDay: '2024-01-25' },
    { $count: 2891, onDay: '2024-01-26' },
    { $count: 2555, onDay: '2024-01-27' },
    { $count: 2735, onDay: '2024-01-28' },
    { $count: 3260, onDay: '2024-01-29' },
    { $count: 6723, onDay: '2024-01-30' },
    { $count: 14869, onDay: '2024-01-31' },
    { $count: 48176, onDay: '2024-02-01' },
    { $count: 14525, onDay: '2024-02-02' },
    { $count: 15977, onDay: '2024-02-03' },
    { $count: 15256, onDay: '2024-02-04' },
    { $count: 12176, onDay: '2024-02-05' },
    { $count: 101776, onDay: '2024-02-06' },
    { $count: 802399, onDay: '2024-02-07' },
    { $count: 347903, onDay: '2024-02-08' },
    { $count: 140638, onDay: '2024-02-09' },
    { $count: 98735, onDay: '2024-02-10' },
    { $count: 342309, onDay: '2024-02-11' },
    { $count: 55642, onDay: '2024-02-12' },
    { $count: 39447, onDay: '2024-02-13' },
    { $count: 30911, onDay: '2024-02-14' },
    { $count: 24510, onDay: '2024-02-15' },
    { $count: 19108, onDay: '2024-02-16' },
    { $count: 17837, onDay: '2024-02-17' },
    { $count: 19801, onDay: '2024-02-18' },
    { $count: 17773, onDay: '2024-02-19' },
    { $count: 20799, onDay: '2024-02-20' },
    { $count: 20896, onDay: '2024-02-21' },
    { $count: 15237, onDay: '2024-02-22' },
    { $count: 14405, onDay: '2024-02-23' },
    { $count: 12563, onDay: '2024-02-24' },
    { $count: 14410, onDay: '2024-02-25' },
    { $count: 12808, onDay: '2024-02-26' },
    { $count: 12473, onDay: '2024-02-27' },
    { $count: 11475, onDay: '2024-02-28' },
    { $count: 12219, onDay: '2024-02-29' },
    { $count: 9734, onDay: '2024-03-01' },
    { $count: 9357, onDay: '2024-03-02' },
    { $count: 8989, onDay: '2024-03-03' },
    { $count: 8659, onDay: '2024-03-04' },
    { $count: 8761, onDay: '2024-03-05' },
    { $count: 8366, onDay: '2024-03-06' },
    { $count: 8184, onDay: '2024-03-07' },
    { $count: 9114, onDay: '2024-03-08' },
    { $count: 9332, onDay: '2024-03-09' },
    { $count: 9100, onDay: '2024-03-10' },
    { $count: 8402, onDay: '2024-03-11' },
    { $count: 8638, onDay: '2024-03-12' },
    { $count: 8338, onDay: '2024-03-13' },
    { $count: 8926, onDay: '2024-03-14' },
    { $count: 7656, onDay: '2024-03-15' },
    { $count: 6450, onDay: '2024-03-16' },
    { $count: 6384, onDay: '2024-03-17' },
    { $count: 5979, onDay: '2024-03-18' },
    { $count: 6420, onDay: '2024-03-19' },
    { $count: 7501, onDay: '2024-03-20' },
    { $count: 6815, onDay: '2024-03-21' },
    { $count: 5910, onDay: '2024-03-22' },
    { $count: 6646, onDay: '2024-03-23' },
    { $count: 6652, onDay: '2024-03-24' },
    { $count: 6824, onDay: '2024-03-25' },
    { $count: 6611, onDay: '2024-03-26' },
    { $count: 5893, onDay: '2024-03-27' },
    { $count: 6467, onDay: '2024-03-28' },
    { $count: 5976, onDay: '2024-03-29' },
    { $count: 5367, onDay: '2024-03-30' },
    { $count: 5701, onDay: '2024-03-31' },
    { $count: 5618, onDay: '2024-04-01' },
    { $count: 5866, onDay: '2024-04-02' },
    { $count: 5841, onDay: '2024-04-03' },
    { $count: 5590, onDay: '2024-04-04' },
    { $count: 5329, onDay: '2024-04-05' },
    { $count: 5083, onDay: '2024-04-06' },
    { $count: 43360, onDay: '2024-04-07' },
    { $count: 35442, onDay: '2024-04-08' },
    { $count: 15229, onDay: '2024-04-09' },
    { $count: 16672, onDay: '2024-04-10' },
    { $count: 18181, onDay: '2024-04-11' },
    { $count: 17596, onDay: '2024-04-12' },
    { $count: 18066, onDay: '2024-04-13' },
    { $count: 14166, onDay: '2024-04-14' },
    { $count: 9964, onDay: '2024-04-15' },
    { $count: 14617, onDay: '2024-04-16' },
    { $count: 8817, onDay: '2024-04-17' },
    { $count: 5359, onDay: '2024-04-18' },
    { $count: 4914, onDay: '2024-04-19' },
    { $count: 4873, onDay: '2024-04-20' },
    { $count: 4659, onDay: '2024-04-21' },
    { $count: 4378, onDay: '2024-04-22' },
    { $count: 4343, onDay: '2024-04-23' },
    { $count: 4228, onDay: '2024-04-24' },
    { $count: 4141, onDay: '2024-04-25' },
    { $count: 4138, onDay: '2024-04-26' },
    { $count: 4029, onDay: '2024-04-27' },
    { $count: 4173, onDay: '2024-04-28' },
    { $count: 5450, onDay: '2024-04-29' },
    { $count: 5086, onDay: '2024-04-30' },
    { $count: 4730, onDay: '2024-05-01' },
    { $count: 4269, onDay: '2024-05-02' },
    { $count: 3920, onDay: '2024-05-03' },
    { $count: 3922, onDay: '2024-05-04' },
    { $count: 3871, onDay: '2024-05-05' },
    { $count: 4411, onDay: '2024-05-06' },
    { $count: 4041, onDay: '2024-05-07' },
    { $count: 3920, onDay: '2024-05-08' },
    { $count: 4217, onDay: '2024-05-09' },
    { $count: 4094, onDay: '2024-05-10' },
    { $count: 3937, onDay: '2024-05-11' },
    { $count: 3661, onDay: '2024-05-12' },
    { $count: 3682, onDay: '2024-05-13' },
    { $count: 3416, onDay: '2024-05-14' },
    { $count: 3614, onDay: '2024-05-15' },
    { $count: 3482, onDay: '2024-05-16' },
    { $count: 3409, onDay: '2024-05-17' },
    { $count: 3697, onDay: '2024-05-18' },
    { $count: 3533, onDay: '2024-05-19' },
    { $count: 3423, onDay: '2024-05-20' },
    { $count: 3878, onDay: '2024-05-21' },
    { $count: 4103, onDay: '2024-05-22' },
    { $count: 4900, onDay: '2024-05-23' },
    { $count: 3990, onDay: '2024-05-24' },
    { $count: 3781, onDay: '2024-05-25' },
    { $count: 3808, onDay: '2024-05-26' },
    { $count: 5252, onDay: '2024-05-27' },
    { $count: 4117, onDay: '2024-05-28' },
    { $count: 4308, onDay: '2024-05-29' },
    { $count: 3883, onDay: '2024-05-30' },
    { $count: 3872, onDay: '2024-05-31' },
    { $count: 4098, onDay: '2024-06-01' },
    { $count: 3976, onDay: '2024-06-02' },
    { $count: 4103, onDay: '2024-06-03' },
    { $count: 3890, onDay: '2024-06-04' },
    { $count: 3620, onDay: '2024-06-05' },
    { $count: 3315, onDay: '2024-06-06' },
    { $count: 3160, onDay: '2024-06-07' },
    { $count: 88307, onDay: '2024-06-08' },
    { $count: 18788, onDay: '2024-06-09' },
    { $count: 8063, onDay: '2024-06-10' },
    { $count: 10307, onDay: '2024-06-11' },
    { $count: 18112, onDay: '2024-06-12' },
    { $count: 24672, onDay: '2024-06-13' },
    { $count: 10816, onDay: '2024-06-14' },
    { $count: 20750, onDay: '2024-06-15' },
    { $count: 14169, onDay: '2024-06-16' },
    { $count: 8795, onDay: '2024-06-17' },
    { $count: 6821, onDay: '2024-06-18' },
    { $count: 5926, onDay: '2024-06-19' },
    { $count: 4873, onDay: '2024-06-20' },
    { $count: 4567, onDay: '2024-06-21' },
    { $count: 4566, onDay: '2024-06-22' },
    { $count: 4404, onDay: '2024-06-23' },
    { $count: 4281, onDay: '2024-06-24' },
    { $count: 3978, onDay: '2024-06-25' },
    { $count: 4019, onDay: '2024-06-26' },
    { $count: 4269, onDay: '2024-06-27' },
    { $count: 3829, onDay: '2024-06-28' },
    { $count: 3948, onDay: '2024-06-29' },
    { $count: 3900, onDay: '2024-06-30' },
    { $count: 4230, onDay: '2024-07-01' },
    { $count: 4009, onDay: '2024-07-02' },
    { $count: 4393, onDay: '2024-07-03' },
    { $count: 4008, onDay: '2024-07-04' },
    { $count: 4926, onDay: '2024-07-05' },
    { $count: 6270, onDay: '2024-07-06' },
    { $count: 4592, onDay: '2024-07-07' },
    { $count: 4216, onDay: '2024-07-08' },
    { $count: 4221, onDay: '2024-07-09' },
    { $count: 3641, onDay: '2024-07-10' },
    { $count: 3440, onDay: '2024-07-11' },
    { $count: 3974, onDay: '2024-07-12' },
    { $count: 3528, onDay: '2024-07-13' },
    { $count: 3644, onDay: '2024-07-14' },
    { $count: 3874, onDay: '2024-07-15' },
    { $count: 3350, onDay: '2024-07-16' },
    { $count: 3371, onDay: '2024-07-17' },
    { $count: 3181, onDay: '2024-07-18' },
    { $count: 3146, onDay: '2024-07-19' },
    { $count: 3041, onDay: '2024-07-20' },
    { $count: 3192, onDay: '2024-07-21' },
    { $count: 3387, onDay: '2024-07-22' },
    { $count: 3400, onDay: '2024-07-23' },
    { $count: 3253, onDay: '2024-07-24' },
    { $count: 4084, onDay: '2024-07-25' },
    { $count: 4381, onDay: '2024-07-26' },
    { $count: 3594, onDay: '2024-07-27' },
    { $count: 3469, onDay: '2024-07-28' },
    { $count: 4015, onDay: '2024-07-29' },
    { $count: 4381, onDay: '2024-07-30' },
    { $count: 3771, onDay: '2024-07-31' },
    { $count: 3744, onDay: '2024-08-01' },
    { $count: 3766, onDay: '2024-08-02' },
    { $count: 3578, onDay: '2024-08-03' },
    { $count: 3808, onDay: '2024-08-04' },
    { $count: 4557, onDay: '2024-08-05' },
    { $count: 6335, onDay: '2024-08-06' },
    { $count: 9213, onDay: '2024-08-07' },
    { $count: 8337, onDay: '2024-08-08' },
    { $count: 6926, onDay: '2024-08-09' },
    { $count: 6376, onDay: '2024-08-10' },
    { $count: 5470, onDay: '2024-08-11' },
    { $count: 6157, onDay: '2024-08-12' },
    { $count: 10515, onDay: '2024-08-13' },
    { $count: 12032, onDay: '2024-08-14' },
    { $count: 9847, onDay: '2024-08-15' },
    { $count: 8295, onDay: '2024-08-16' },
    { $count: 8970, onDay: '2024-08-17' },
    { $count: 7596, onDay: '2024-08-18' },
    { $count: 6715, onDay: '2024-08-19' },
    { $count: 5723, onDay: '2024-08-20' },
    { $count: 5885, onDay: '2024-08-21' },
    { $count: 6017, onDay: '2024-08-22' },
    { $count: 5460, onDay: '2024-08-23' },
    { $count: 5392, onDay: '2024-08-24' },
    { $count: 5580, onDay: '2024-08-25' },
    { $count: 5304, onDay: '2024-08-26' },
    { $count: 5285, onDay: '2024-08-27' },
    { $count: 5543, onDay: '2024-08-28' },
    { $count: 106203, onDay: '2024-08-29' },
    { $count: 272553, onDay: '2024-08-30' },
    { $count: 733224, onDay: '2024-08-31' },
    { $count: 569678, onDay: '2024-09-01' },
    { $count: 423867, onDay: '2024-09-02' },
    { $count: 348303, onDay: '2024-09-03' },
    { $count: 254605, onDay: '2024-09-04' },
    { $count: 234589, onDay: '2024-09-05' },
    { $count: 170251, onDay: '2024-09-06' },
    { $count: 126219, onDay: '2024-09-07' },
    { $count: 108999, onDay: '2024-09-08' },
    { $count: 109859, onDay: '2024-09-09' },
    { $count: 95671, onDay: '2024-09-10' },
    { $count: 92269, onDay: '2024-09-11' },
    { $count: 82907, onDay: '2024-09-12' },
    { $count: 70024, onDay: '2024-09-13' },
    { $count: 71654, onDay: '2024-09-14' },
    { $count: 65662, onDay: '2024-09-15' },
    { $count: 81036, onDay: '2024-09-16' },
    { $count: 66331, onDay: '2024-09-17' },
    { $count: 50829, onDay: '2024-09-18' },
    { $count: 39584, onDay: '2024-09-19' },
    { $count: 35434, onDay: '2024-09-20' },
    { $count: 33095, onDay: '2024-09-21' },
    { $count: 37537, onDay: '2024-09-22' },
    { $count: 45455, onDay: '2024-09-23' },
    { $count: 49173, onDay: '2024-09-24' },
    { $count: 45084, onDay: '2024-09-25' },
    { $count: 37078, onDay: '2024-09-26' },
    { $count: 33144, onDay: '2024-09-27' },
    { $count: 30804, onDay: '2024-09-28' },
    { $count: 32354, onDay: '2024-09-29' },
    { $count: 30557, onDay: '2024-09-30' },
    { $count: 27708, onDay: '2024-10-01' },
    { $count: 25267, onDay: '2024-10-02' },
    { $count: 25163, onDay: '2024-10-03' },
    { $count: 23595, onDay: '2024-10-04' },
    { $count: 22278, onDay: '2024-10-05' },
    { $count: 23413, onDay: '2024-10-06' },
    { $count: 24931, onDay: '2024-10-07' },
    { $count: 23232, onDay: '2024-10-08' },
    { $count: 23257, onDay: '2024-10-09' },
    { $count: 21817, onDay: '2024-10-10' },
    { $count: 19048, onDay: '2024-10-11' },
    { $count: 13730, onDay: '2024-10-12' },
    { $count: 12358, onDay: '2024-10-13' },
    { $count: 11707, onDay: '2024-10-14' },
    { $count: 10366, onDay: '2024-10-15' },
    { $count: 20217, onDay: '2024-10-16' },
    { $count: 763303, onDay: '2024-10-17' },
    { $count: 539443, onDay: '2024-10-18' },
    { $count: 310919, onDay: '2024-10-19' },
    { $count: 235944, onDay: '2024-10-20' },
    { $count: 185291, onDay: '2024-10-21' },
    { $count: 145672, onDay: '2024-10-22' },
    { $count: 114310, onDay: '2024-10-23' },
    { $count: 86317, onDay: '2024-10-24' },
    { $count: 74669, onDay: '2024-10-25' },
    { $count: 72024, onDay: '2024-10-26' },
    { $count: 61863, onDay: '2024-10-27' },
    { $count: 58426, onDay: '2024-10-28' },
    { $count: 53763, onDay: '2024-10-29' },
    { $count: 45462, onDay: '2024-10-30' },
    { $count: 44394, onDay: '2024-10-31' },
    { $count: 39955, onDay: '2024-11-01' },
    { $count: 38199, onDay: '2024-11-02' },
    { $count: 38760, onDay: '2024-11-03' },
    { $count: 37770, onDay: '2024-11-04' },
    { $count: 41150, onDay: '2024-11-05' },
    { $count: 83118, onDay: '2024-11-06' },
    { $count: 121657, onDay: '2024-11-07' },
    { $count: 100532, onDay: '2024-11-08' },
    { $count: 110116, onDay: '2024-11-09' },
    { $count: 124701, onDay: '2024-11-10' },
    { $count: 177284, onDay: '2024-11-11' },
    { $count: 280896, onDay: '2024-11-12' },
    { $count: 542989, onDay: '2024-11-13' },
    { $count: 989752, onDay: '2024-11-14' },
    { $count: 962888, onDay: '2024-11-15' },
    { $count: 872611, onDay: '2024-11-16' },
    { $count: 768569, onDay: '2024-11-17' },
  ])

  // let loadingChart = $state(true)
  let stats = $derived.by(() => {
    const arrFull = [...staticStats, ...(data?.dailyStats ?? [])]
    const arr = arrFull.map((stat, index, array) => {
      const cumulativeSum = array.slice(0, index + 1).reduce((sum, curr) => sum + curr.$count, 0)

      return {
        onDay: new Date(stat.onDay),
        rawCount: stat.$count,
        count: cumulativeSum,
      }
    })

    return arr
  })
  let lastValue = $state(data?.lastValue)
  let lastProfiles = $state(data?.lastProfiles)
  let lastHourSpeedPerSecond = $state(data?.lastHourSpeedPerSecond)

  let last7Days = $derived(
    stats.slice(-7).map((day) => ({
      date: day.onDay,
      newUsers: day.rawCount,
    })),
  )

  let brushRange = $state<Array<Date | null>>([null, null])

  // $effect(() => {
  //   AtController.getLatestGlobalStats()
  //     .then((res) => {
  //       if (res) {
  //         if (res && res.dailyStats) {
  //           for (const stat of res.dailyStats) {
  //             staticStats.push(stat)
  //           }
  //           if (res.lastValue) {
  //             lastValue = res.lastValue
  //           }
  //           if (res.lastProfile) {
  //             lastProfile = res.lastProfile
  //           }
  //         }
  //       }
  //     })
  //     .finally(() => {
  //       loadingChart = false
  //     })
  // })

  const format = (d: Date, period: PeriodType) => {
    return new Intl.DateTimeFormat(undefined, {}).format(d)
  }

  // Add this function at the top of the script section
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }
</script>

<Og title="Sky Zoo - Whale Stats" {description} {og} />

<div class="flex flex-col gap-8">
  <h2 class="flex items-end justify-between gap-2 text-2xl font-bold">
    <span> 🐋</span>
    <div class="flex items-center gap-4">
      {#if lastHourSpeedPerSecond}
        <div class="badge badge-info" title="Last hour speed">
          <span class="opacity-70">+</span>
          <span>{lastHourSpeedPerSecond?.toLocaleString()}</span>
          <span class="text-xs opacity-70">/sec</span>
        </div>
      {/if}
      {#if lastValue}
        <span
          transition:fade
          class="font-mono text-3xl font-extrabold text-base-content/70 text-info"
        >
          {lastValue.pos_bsky!.toLocaleString()}
        </span>
      {/if}
    </div>
  </h2>
  <div class="h-[300px]">
    <AreaChart
      data={stats.filter(
        (d) =>
          (brushRange[0] == null || d.onDay >= brushRange[0]) &&
          (brushRange[1] == null || d.onDay <= brushRange[1]),
      )}
      x="onDay"
      series={[{ key: 'count', color: 'oklch(var(--in))' }]}
      props={{
        xAxis: {
          format: PeriodType.Day,
          ticks: 6,
        },
        yAxis: {
          tweened: { duration: 200 },
          format: 'metric',
        },
      }}
    >
      <svelte:fragment slot="marks">
        <LinearGradient class="from-info/50 to-info/0" vertical let:url>
          <Area line={{ class: 'stroke-2 stroke-info' }} fill={url} tweened={{ duration: 200 }} />
        </LinearGradient>
      </svelte:fragment>

      <svelte:fragment slot="tooltip">
        <Tooltip.Root let:data>
          <Tooltip.Header>{format(data.onDay, PeriodType.Day)}</Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item
              label="Day"
              format="integer"
              value={data.rawCount.toLocaleString()}
              valueAlign="right"
            />
            <Tooltip.Item
              label="Total"
              format="integer"
              value={data.count.toLocaleString()}
              valueAlign="right"
            />
          </Tooltip.List>
        </Tooltip.Root>
      </svelte:fragment>
    </AreaChart>
  </div>

  <div class="h-[80px]">
    <AreaChart
      data={stats}
      x="onDay"
      y="rawCount"
      padding={{ left: 16 }}
      axis={false}
      props={{
        area: {
          class: 'fill-info/20',
          line: { class: 'stroke-2 stroke-info' },
        },
      }}
      tooltip={false}
    >
      <svelte:fragment slot="aboveMarks">
        <Brush
          on:change={(e) => {
            // @ts-expect-error
            brushRange = e.detail.xDomain
          }}
        />
      </svelte:fragment>
    </AreaChart>
  </div>

  <div class="text-center text-sm text-base-content/70">
    <p>Shows the growth of Bluesky users over time</p>
  </div>

  <hr class="border-base-content/20" />

  <h2 class="flex items-end justify-between gap-2 text-2xl font-bold">
    <div>🐋<span class="ml-2 text-sm font-normal text-base-content/70">last 7 days</span></div>
    {#if lastValue}
      <span transition:fade class="text-sm font-normal text-base-content/70">
        Data updated at {new Intl.DateTimeFormat(undefined, {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(new Date(lastValue.createdAt))}
      </span>
    {/if}
  </h2>
  <div class="overflow-x-auto">
    {#if data?.dailyStats}
      <table class="table">
        <thead>
          <tr>
            {#each last7Days as day}
              <th class="text-center"
                >{new Intl.DateTimeFormat(undefined, { dateStyle: 'short' }).format(day.date)}</th
              >
            {/each}
          </tr>
        </thead>
        <tbody>
          <tr>
            {#each last7Days as day, i}
              <td class="text-center">
                {#if i === last7Days.length - 1}
                  <span class="text-info">
                    +{day.newUsers.toLocaleString()}
                  </span>
                {:else}
                  +{day.newUsers.toLocaleString()}
                {/if}
              </td>
            {/each}
          </tr>
          <tr>
            {#each last7Days as day, i}
              <td class="text-center">
                {#if i === last7Days.length - 1}
                  ...
                  <!-- I should do this when I will not be lazy -->
                {:else}
                  +{(day.newUsers / 24 / 60 / 60).toFixed(1).toLocaleString()}
                  <span class="text-xs text-base-content/50">/sec</span>
                {/if}
              </td>
            {/each}
          </tr>
        </tbody>
      </table>
    {/if}
  </div>

  {#if lastValue}
    <div>🐋<span class="ml-2 text-sm font-normal text-base-content/70">Newskies</span></div>
    <div class="flex flex-wrap justify-around gap-2">
      {#each (lastProfiles ?? []).slice(0, 5) as profile}
        <div class="flex flex-col items-center gap-2">
          <Avatar {...profile} size="w-20" />
          <!-- <span class="font-mono text-xs text-primary"
            >@{profile.handle.replaceAll('.bsky.social', '...')}</span
          > -->
        </div>
      {/each}
    </div>

    <div class="mt-4 flex flex-col items-center gap-2">
      <div class="">Here's a welcome post example:</div>
      <div class="mockup-code relative w-full max-w-2xl bg-base-200">
        {#if lastProfiles}
          {@const welcomeMessage = ` welcome to Bluesky! 🎉

From skyzoo.blue, I saw that you just landed
You are #${lastValue!.pos_bsky!.toLocaleString()} on 🦋

Feel free to ask me any questions or just say hi 👋
`}
          <button
            aria-label="Copy welcome message"
            class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
            onclick={() => copyToClipboard(welcomeMessage)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <pre><code>{welcomeMessage}</code></pre>
        {/if}
      </div>
    </div>
  {/if}
</div>
