// TravelCardData 接口定义
export interface TravelCardData {
  id: string
  category: string
  day: string
  time: string
  title: string
  departureTime?: string
  arrivalTime?: string
  duration?: string
  transportation?: string
  description?: string[]
  highlights?: string
  amapUrl?: string
  tips?: string[]
  isPlanB?: boolean // 新增：是否为备选方案
  planAId?: string // 新增：如果isPlanB为true，则表示其关联的Plan A卡片的ID
}

// 旅行类别枚举
export const TRAVEL_CATEGORIES = [
  { value: '交通', label: '交通' },
  { value: '美食', label: '美食' },
  { value: '住宿', label: '住宿' },
  { value: '休息', label: '休息' },
  { value: '观光', label: '观光' },
  { value: '文化', label: '文化' },
  { value: '娱乐', label: '娱乐' }
] as const

// 旅行日期枚举
export const TRAVEL_DAYS = [
  { value: 'Day 1', label: 'Day 1' },
  { value: 'Day 2', label: 'Day 2' }
] as const

export const travelCardsData: TravelCardData[] = [
    // Day 1
    {
        id: 'day1-card0',
        title: '出发前往南京',
        category: '交通',
        day: 'Day 1',
        time: '09:00-12:42',
        departureTime: '北京 09:00，上海 09:16',
        arrivalTime: '上海 11:56，北京 12:29',
        transportation: '北京G5 | 上海C3005',
        description: ['充电器、充电宝、线', '相机', '雨伞', '身份证', '风衣', '浴巾','怪用品和怪玩具'],
    },
    {
        id: 'day1-card1',
        title: '前往冯家鸭子',
        category: '美食',
        day: 'Day 1',
        time: '12:20-14:00',
        departureTime: '12:20',
        arrivalTime: '12:42',
        duration: '约1小时',
        transportation: '出租车',
        description: ['南京特色老卤鸭专卖店', '体验地道南京美食'],
        amapUrl: 'https://www.amap.com/place/B0FFGHHVZG',
    },
    {
        id: 'day1-card2',
        title: '从冯家鸭子前往酒店',
        category: '住宿',
        day: 'Day 1',
        time: '14:00-14:15',
        departureTime: '14:00',
        arrivalTime: '14:15',
        transportation: '出租车',
        amapUrl: 'https://www.amap.com/place/B0LA9DYYE8',
    },
    {
        id: 'day1-card3',
        title: '酒店休整',
        category: '休息',
        day: 'Day 1',
        time: '14:00-16:00',
        duration: '约2小时',
        description: ['办理入住手续', '放置行李', '休息和稍微怪'],
    },
    {
        id: 'day1-card4',
        title: '从酒店出发前往浦口码头',
        category: '交通',
        day: 'Day 1',
        time: '16:00-16:20',
        departureTime: '16:00',
        arrivalTime: '16:20',
        transportation: '出租车',
        amapUrl: 'https://www.amap.com/place/B001908FKL',
    },
    {
        id: 'day1-card5',
        title: '浦口码头 → 中山码头',
        category: '观光',
        day: 'Day 1',
        time: '16:40-17:00',
        departureTime: '16:40',
        arrivalTime: '17:00',
        transportation: '宁浦线轮渡',
        description: ['体验过江轮渡', '欣赏长江景色'],
        amapUrl: 'https://www.amap.com/place/B001908XJQ',
    },
    {
        id: 'day1-card6',
        title: '中山码头 → 铁路轮渡栈桥旧址',
        category: '文化',
        day: 'Day 1',
        time: '17:00-17:23',
        departureTime: '17:00',
        arrivalTime: '17:23',
        transportation: '步行',
        description: ['步行前往历史遗址', '欣赏江岸风光'],
        amapUrl: 'https://www.amap.com/place/B0FFHYEYV7',
    },
    {
        id: 'day1-card7',
        title: '铁路轮渡栈桥旧址探访',
        category: '文化',
        day: 'Day 1',
        time: '17:23-17:43',
        duration: '约20分钟',
        description: ['游览历史悠久的铁路轮渡设施', '感受工业遗产魅力'],
    },
    {
        id: 'day1-card8',
        title: '栈桥旧址 → 长江大桥玻璃栈桥',
        category: '文化',
        day: 'Day 1',
        time: '17:43-18:00',
        departureTime: '17:43',
        arrivalTime: '18:00',
        transportation: '步行',
        description: ['步行前往玻璃栈桥', '欣赏江岸风光'],
        amapUrl: 'https://www.amap.com/place/B0IDK5JKHR',
    },
    {
        id: 'day1-card9',
        title: '南京长江大桥日落观赏',
        category: '观光',
        day: 'Day 1',
        time: '18:00-19:30',
        duration: '约1小时，19:30左右',
        description: [
            '货运火车约30分钟一趟，可拍摄火车经过大桥的画面',
            '在玻璃栈道上欣赏长江日落',
            '日落时间约19:09',
            '18:30观看南京长江大桥亮灯',
        ],
        tips: [
            '江风强劲，建议穿着防风外套并扎好头发。',
            '最佳拍摄点：南岸人行道和玻璃栈桥'
        ],
    },
    {
        id: 'day1-card10',
        title: '日式晚餐：松澜·烧鸟酒场(云南北路店)',
        category: '美食',
        day: 'Day 1',
        time: '19:30-21:30',
        departureTime: '19:30',
        arrivalTime: '19:48-19:55',
        duration: '18-25分钟',
        transportation: '出租车',
        description: ['口碑和性价比不错的日式烧鸟料理'],
        tips: ['建议提前预约'],
        amapUrl: 'https://www.amap.com/place/B0J2ZZCIDL',
    },
    {
        id: 'day1-card11',
        title: '晚餐后返回酒店',
        category: '交通',
        day: 'Day 1',
        time: '21:30-21:50',
        departureTime: '21:30',
        arrivalTime: '21:50-22:00',
        transportation: '地铁/公交',
        amapUrl: 'https://www.amap.com/place/B0LA9DYYE8',
    },

    // Day 2
    {
        id: 'day2-card1',
        title: '退房，出发前往动物园',
        category: '住宿',
        day: 'Day 2',
        time: '07:00-08:15',
        departureTime: '07:50',
        arrivalTime: '08:05',
        transportation: '步行',
        description: [
            '7:00 起床洗漱',
            '7:45办理酒店退房手续',
            '7:50步行前往动物园北门肯德基'
        ],
        tips: [
            '北门丰巢提供免费行李寄存服务',
            '若无免费寄存，可在厕所附近寄存行李，收费'
        ],
        amapUrl: 'https://www.amap.com/place/B00190BSAF',
    },
    {
        id: 'day2-card2',
        title: '肯德基早餐与行李寄存',
        category: '美食',
        day: 'Day 2',
        time: '08:05-08:20',
        duration: '约15分钟',
        transportation: '步行',
        description: [
            '在动物园附近肯德基享用早餐',
            '可分头行动：点餐+寄存行李'
        ],
        tips: [
            '北门丰巢提供免费行李寄存服务',
            '若无免费寄存，可在厕所附近付费寄存行李'
        ],
        amapUrl: 'https://www.amap.com/place/B00190A8KZ',
    },
    {
        id: 'day2-card3',
        title: '红山森林动物园游览',
        category: '娱乐',
        day: 'Day 2',
        time: '08:30-13:00',
        duration: '约4.5小时',
        transportation: '步行+观光车',
        description: [
            '北门入园游览',
            '重点观看猫科动物和鸟类'
        ],
        highlights: `### 1. 北门区域及观光车：
- 可选择参观大熊猫馆（早晨大熊猫可能较为活跃，具体参观时间请灵活安排在乘坐观光车前）。
- 随后乘坐园内观光车前往中心广场区域。

### 2. 中心广场周边主要场馆：
- 抵达中心广场后，依次游览考拉馆、高黎贡山生态多样性展区（小熊猫、各种鸟类等）、企鹅馆、虎山/狮虎山、中国猫科馆、猫科星球（小型猫科动物）、狼谷、本土动物区、细尾獴馆。

### 3. 小红山片区及返回：

- 前往小红山片区，游览热带鸟馆、犀鸟馆、鹦鹉馆、雉鸡园、鹤园、狐猴岛。
- 游览完毕后，从此区域或根据园内指引返回北门准备出园。
- 可在出园前，于北门附近的“森林市集”文创店选购纪念品（可选，约安排在12:20 PM - 12:45 PM）。
        `,
        tips: [
            '夏季蚊虫较多，建议采取防蚊措施',
            '园内有麦当劳、鸡鸣汤包等餐饮',
            '可在森林市集文创店选购纪念品'
        ],
    },
    {
        id: 'day2-card4',
        title: '午餐安排：滕家面馆(红山店)',
        category: '美食',
        day: 'Day 2',
        time: '13:00-14:15',
        departureTime: '13:00',
        arrivalTime: '13:13',
        duration: '约1小时',
        transportation: '步行',
        description: ['享用地道南京面食', '为下午行程补充能量'],
        amapUrl: 'https://www.amap.com/place/B0FFFLIYBK',
        tips: ['若时间充裕，可考虑前往新街口'],
    },
    {
        id: 'day2-card4-planB',
        title: '午餐安排：徐家鸭子店(红山店)',
        category: '美食', // 假设类别与Plan A相同
        day: 'Day 2',    // 假设日期与Plan A相同
        time: '13:00-14:15', // 假设时间与Plan A相同或根据实际情况调整
        departureTime: '13:00',
        arrivalTime: '13:15',
        duration: '约1小时',
        transportation: '步行',
        description: ['南京特色鸭肉料理', '体验当地老字号美食'],
        amapUrl: 'https://ditu.amap.com/place/B0FFKX4C1F',
        isPlanB: true,
        planAId: 'day2-card4',
    },
    {
        id: 'day2-card5',
        title: '前往南京南站',
        category: '交通',
        day: 'Day 2',
        time: '14:15-15:00',
        departureTime: '14:15',
        arrivalTime: '15:00',
        duration: '约45分钟',
        transportation: '地铁1号线',
        description: ['从红山动物园站乘地铁1号线', '往中国药科大学方向直达南京南站'],
        amapUrl: 'https://www.amap.com/place/B00190BSAF',
    },
    {
        id: 'day2-card6',
        title: '离开南京',
        category: '交通',
        day: 'Day 2',
        time: '15:00-16:39',
        departureTime: '北京 16:01，上海 16:39',
        transportation: '北京G20 | 上海C3005',
        description: ['务必在15:30前到达车站', '预留充足时间以免耽误行程'],
    }
]
