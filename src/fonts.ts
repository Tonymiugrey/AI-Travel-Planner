import { createFont } from '@tamagui/core'

// 创建混合字体配置：英文数字用SF Pro Display，中文用苹方
const mixedFontFamily = [
  '-apple-system',         // Apple 系统字体
  'BlinkMacSystemFont',    // macOS 系统字体
  'Segoe UI',              // Windows 系统字体
  'Microsoft YaHei',       // Windows 微软雅黑中文
  'Noto Sans CJK SC',      // Android 思源黑体简体中文
  'Noto Sans SC',          // Android 思源黑体简体中文 (Web字体)
  'Roboto',                // Android 默认英文字体
  'Helvetica Neue',        // iOS 后备英文字体
  'Arial',                 // 通用后备英文字体
  'sans-serif'             // 系统默认无衬线字体
].join(', ')

export const headingFont = createFont({
  family: mixedFontFamily,
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 22,
    9: 30,
    10: 42,
    11: 52,
    12: 62,
    13: 72,
    14: 92,
    15: 114,
    16: 124,
  },
  lineHeight: {
    1: 14,
    2: 15,
    3: 16,
    4: 17,
    5: 19,
    6: 21,
    7: 23,
    8: 25,
    9: 33,
    10: 45,
    11: 55,
    12: 65,
    13: 75,
    14: 95,
    15: 117,
    16: 127,
  },
  weight: {
    1: '300',   // Light
    2: '400',   // Regular
    3: '500',   // Medium
    4: '600',   // Semibold
    5: '700',   // Bold
    6: '800',   // Heavy
  },
  letterSpacing: {
    1: 0,
    2: -0.15,
    3: -0.2,
    4: -0.25,
    5: -0.3,
    6: -0.35,
    7: -0.4,
    8: -0.45,
    9: -0.5,
    10: -0.55,
    11: -0.6,
    12: -0.65,
    13: -0.7,
    14: -0.75,
    15: -0.8,
    16: -0.85,
  },
  transform: {
    6: 'uppercase',
    7: 'none',
  },
  color: {
    6: '$colorFocus',
    7: '$color',
  },
})

export const bodyFont = createFont({
  family: mixedFontFamily,
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 22,
    9: 30,
    10: 42,
    11: 52,
    12: 62,
    13: 72,
    14: 92,
    15: 114,
    16: 124,
  },
  lineHeight: {
    1: 14,
    2: 15,
    3: 16,
    4: 17,
    5: 19,
    6: 21,
    7: 23,
    8: 25,
    9: 33,
    10: 45,
    11: 55,
    12: 65,
    13: 75,
    14: 95,
    15: 117,
    16: 127,
  },
  weight: {
    1: '300',   // Light
    2: '400',   // Regular
    3: '500',   // Medium
    4: '600',   // Semibold
    5: '700',   // Bold
    6: '800',   // Heavy
  },
  letterSpacing: {
    1: 0,
    2: -0.15,
    3: -0.2,
    4: -0.25,
    5: -0.3,
    6: -0.35,
    7: -0.4,
    8: -0.45,
    9: -0.5,
    10: -0.55,
    11: -0.6,
    12: -0.65,
    13: -0.7,
    14: -0.75,
    15: -0.8,
    16: -0.85,
  },
})
