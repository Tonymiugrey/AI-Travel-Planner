import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Sheet, YStack, XStack, Button, Text, View } from 'tamagui'
import { LinearGradient } from 'tamagui/linear-gradient'
import { Check, X } from '@tamagui/lucide-icons'

interface TimePickerProps {
  isOpen: boolean
  onClose: () => void
  value: string // 格式: "09:00" 或 "14:30"
  onSave: (value: string) => void
  title: string
}

interface WheelItem {
  value: string
  display: string
}

const generateHours = (): WheelItem[] => {
  const hours: WheelItem[] = []
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0')
    hours.push({ value: hour, display: hour })
  }
  return hours
}

const generateMinutes = (): WheelItem[] => {
  const minutes: WheelItem[] = []
  for (let i = 0; i < 60; i++) {
    const minute = i.toString().padStart(2, '0')
    minutes.push({ value: minute, display: minute })
  }
  return minutes
}

const WheelPicker: React.FC<{
  items: WheelItem[]
  selectedValue: string
  onValueChange: (value: string) => void
  height: number
}> = ({ items, selectedValue, onValueChange, height }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startTranslateY, setStartTranslateY] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [velocity, setVelocity] = useState(0)
  const [lastMoveTime, setLastMoveTime] = useState(0)
  const [lastMoveY, setLastMoveY] = useState(0)
  const [isInertiaScrolling, setIsInertiaScrolling] = useState(false)
  const inertiaAnimationRef = useRef<number | null>(null)
  const lastUpdateTimeRef = useRef(0) // 用于节流更新
  const wheelScrollTimeoutRef = useRef<number | null>(null) // 滚轮滚动延迟
  const accumulatedDeltaRef = useRef(0) // 累积的滚轮增量

  const itemHeight = height / 5 // 每个项目的高度
  const visibleItems = 5 // 可见项目数量
  const centerIndex = Math.floor(visibleItems / 2) // 中心索引

  // 检测是否为触摸设备
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  // 清理动画
  useEffect(() => {
    return () => {
      if (inertiaAnimationRef.current) {
        cancelAnimationFrame(inertiaAnimationRef.current)
      }
      if (wheelScrollTimeoutRef.current) {
        clearTimeout(wheelScrollTimeoutRef.current)
      }
    }
  }, [])

  // 计算初始位置
  useEffect(() => {
    const selectedIndex = items.findIndex(item => item.value === selectedValue)
    if (selectedIndex !== -1) {
      const initialTranslateY = (centerIndex - selectedIndex) * itemHeight
      setTranslateY(initialTranslateY)
    }
  }, [selectedValue, items, itemHeight, centerIndex])

  // 统一的指针事件处理 - 同时支持触摸和鼠标
  const handlePointerStart = (e: React.PointerEvent) => {
    e.preventDefault()
    
    // 停止任何正在进行的惯性滚动
    if (inertiaAnimationRef.current) {
      cancelAnimationFrame(inertiaAnimationRef.current)
      inertiaAnimationRef.current = null
    }
    setIsInertiaScrolling(false)
    
    setIsDragging(true)
    setStartY(e.clientY)
    setStartTranslateY(translateY)
    
    // 重置速度计算相关变量
    setVelocity(0)
    setLastMoveTime(Date.now())
    setLastMoveY(e.clientY)
    
    // 捕获指针以确保在容器外移动时仍能收到事件
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId)
    }
  }

  // 统一的指针移动处理 - 优化性能
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    e.preventDefault()
    
    const currentTime = Date.now()
    const currentY = e.clientY
    const deltaY = currentY - startY
    const newTranslateY = startTranslateY + deltaY
    
    // 计算速度 (像素/毫秒)
    if (lastMoveTime > 0) {
      const timeDelta = currentTime - lastMoveTime
      const yDelta = currentY - lastMoveY
      if (timeDelta > 0) {
        setVelocity(yDelta / timeDelta)
      }
    }
    
    setLastMoveTime(currentTime)
    setLastMoveY(currentY)
    
    // 节流更新：每8ms（约120fps）最多更新一次，匹配120Hz显示器
    if (currentTime - lastUpdateTimeRef.current >= 8) {
      setTranslateY(newTranslateY)
      lastUpdateTimeRef.current = currentTime
    }
  }

  // 统一的指针结束处理
  const handlePointerEnd = (e: React.PointerEvent) => {
    if (!isDragging) return
    e.preventDefault()
    
    setIsDragging(false)
    
    // 释放指针捕获
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId)
    }
    
    // 安全检查：确保 items 数组存在且不为空
    if (!items || items.length === 0) return
    
    // 检查是否需要惯性滚动
    const hasEnoughVelocity = Math.abs(velocity) > 0.3 // 降低最小速度阈值让惯性滚动更容易触发
    
    if (hasEnoughVelocity) {
      startInertiaScroll(velocity)
    } else {
      snapToNearestItem()
    }
  }
  
  // 惯性滚动函数
  const startInertiaScroll = (initialVelocity: number) => {
    setIsInertiaScrolling(true)
    
    let currentVelocity = initialVelocity * 0.7 // 稍微增加初始速度保持
    let currentTranslateY = translateY
    
    const friction = 0.85 // 增加摩擦力让减速更快
    const minVelocity = 0.02 // 提高最小速度阈值
    
    const animate = () => {
      // 减小移动距离让控制更精确
      currentTranslateY += currentVelocity * 16
      setTranslateY(currentTranslateY)
      
      // 应用摩擦力
      currentVelocity *= friction
      
      // 检查是否继续动画
      if (Math.abs(currentVelocity) > minVelocity) {
        inertiaAnimationRef.current = requestAnimationFrame(animate)
      } else {
        // 动画结束，使用专门的惯性吸附逻辑
        setIsInertiaScrolling(false)
        snapToNearestItemAfterInertia(currentTranslateY)
      }
    }
    
    // 取消之前的动画
    if (inertiaAnimationRef.current) {
      cancelAnimationFrame(inertiaAnimationRef.current)
    }
    
    animate()
  }
  
  // 普通吸附到最近项目的函数（用于非惯性滚动）
  const snapToNearestItem = () => {
    // 基于当前 translateY 计算最近的索引
    // 使用与初始化一致的坐标系统：translateY = (centerIndex - selectedIndex) * itemHeight
    const currentIndex = Math.round(centerIndex - translateY / itemHeight)
    const clampedIndex = Math.max(0, Math.min(items.length - 1, currentIndex))
    
    // 多重安全检查：确保索引有效且对应的项目存在且有 value 属性
    if (clampedIndex >= 0 && clampedIndex < items.length && 
        items[clampedIndex] && 
        typeof items[clampedIndex].value !== 'undefined') {
      const finalTranslateY = (centerIndex - clampedIndex) * itemHeight
      setTranslateY(finalTranslateY)
      onValueChange(items[clampedIndex].value)
    }
  }

  // 惯性滚动后的专门吸附逻辑
  const snapToNearestItemAfterInertia = (finalTranslateY?: number) => {
    // 使用传入的最终位置值或当前的 translateY state
    const currentTranslateY = finalTranslateY !== undefined ? finalTranslateY : translateY
    
    // 基于实际的最终位置计算最近的索引
    // 使用与初始化一致的坐标系统：translateY = (centerIndex - selectedIndex) * itemHeight
    // 因此：selectedIndex = centerIndex - translateY / itemHeight
    const currentIndex = Math.round(centerIndex - currentTranslateY / itemHeight)
    const clampedIndex = Math.max(0, Math.min(items.length - 1, currentIndex))
    
    // 多重安全检查：确保索引有效且对应的项目存在且有 value 属性
    if (clampedIndex >= 0 && clampedIndex < items.length && 
        items[clampedIndex] && 
        typeof items[clampedIndex].value !== 'undefined') {
      
      const targetTranslateY = (centerIndex - clampedIndex) * itemHeight
      
      // 使用平滑动画移动到目标位置
      const startTranslateY = currentTranslateY
      const distance = targetTranslateY - startTranslateY
      const duration = 200 // 增加到400ms让动画更自然
      const startTime = Date.now()
      
      const animateSnap = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // 使用更自然的easeOutBack动画曲线，带有轻微的弹性效果
        const easeProgress = progress < 1 
          ? 1 - Math.pow(1 - progress, 3) * (1 - 0.1 * Math.sin(progress * Math.PI))
          : 1
        const animatedTranslateY = startTranslateY + distance * easeProgress
        
        setTranslateY(animatedTranslateY)
        
        if (progress < 1) {
          requestAnimationFrame(animateSnap)
        } else {
          // 动画完成，更新选中值
          onValueChange(items[clampedIndex].value)
        }
      }
      
      animateSnap()
    }
  }

  // 处理滚轮事件 - 改进版本，支持平滑滚动和累积滚动
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    
    // 安全检查：确保 items 数组存在且不为空
    if (!items || items.length === 0) return
    
    // 停止任何正在进行的惯性滚动
    if (inertiaAnimationRef.current) {
      cancelAnimationFrame(inertiaAnimationRef.current)
      inertiaAnimationRef.current = null
    }
    setIsInertiaScrolling(false)
    
    // 累积滚轮增量，提高滚动的平滑度
    accumulatedDeltaRef.current += e.deltaY
    
    // 设置滚轮灵敏度阈值（需要累积到一定量才触发一次跳转）
    const threshold = 50 // 调整这个值来控制滚轮灵敏度
    
    if (Math.abs(accumulatedDeltaRef.current) >= threshold) {
      const direction = accumulatedDeltaRef.current > 0 ? 1 : -1
      
      // 基于当前 translateY 计算当前索引
      const currentIndexFloat = centerIndex - translateY / itemHeight
      const currentIndex = Math.round(currentIndexFloat)
      const safeCurrentIndex = Math.max(0, Math.min(items.length - 1, currentIndex))
      
      // 计算新索引
      const newIndex = Math.max(0, Math.min(items.length - 1, safeCurrentIndex + direction))
      
      // 只有当索引真的改变时才执行动画
      if (newIndex !== safeCurrentIndex && newIndex >= 0 && newIndex < items.length && 
          items[newIndex] && typeof items[newIndex].value !== 'undefined') {
        
        const targetTranslateY = (centerIndex - newIndex) * itemHeight
        
        // 使用平滑动画过渡到新位置
        const startTranslateY = translateY
        const distance = targetTranslateY - startTranslateY
        const duration = 300 // 滚轮动画持续时间
        const startTime = Date.now()
        
        const animateWheel = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          
          // 使用缓动函数让动画更自然
          const easeProgress = 1 - Math.pow(1 - progress, 3) // easeOutCubic
          const animatedTranslateY = startTranslateY + distance * easeProgress
          
          setTranslateY(animatedTranslateY)
          
          if (progress < 1) {
            requestAnimationFrame(animateWheel)
          } else {
            // 动画完成，更新选中值
            onValueChange(items[newIndex].value)
          }
        }
        
        animateWheel()
        
        // 重置累积增量
        accumulatedDeltaRef.current = 0
      }
    }
    
    // 清除之前的延迟定时器
    if (wheelScrollTimeoutRef.current) {
      clearTimeout(wheelScrollTimeoutRef.current)
    }
    
    // 设置一个短暂的延迟来重置累积增量，避免长时间累积
    wheelScrollTimeoutRef.current = window.setTimeout(() => {
      accumulatedDeltaRef.current = 0
    }, 500)
  }

  // 使用 useMemo 缓存样式计算结果 - 优化版本
  const itemStyles = useMemo(() => {
    return items.map((item, index) => {
      // 计算当前项目在视觉上的位置
      const itemY = index * itemHeight + translateY
      const centerY = centerIndex * itemHeight
      
      // 计算距离中心位置的距离（像素）
      const distanceFromCenter = Math.abs(itemY - centerY)
      
      // 基于距离计算相对位置（0 = 在中心，1+ = 远离中心）
      const relativeDistance = distanceFromCenter / itemHeight
      
      // 使用更简单的插值函数减少计算量
      const smoothDistance = Math.min(relativeDistance, 2.5) // 稍微增加可见范围
      
      // 简化计算：使用线性插值而不是复杂的指数函数
      const distanceRatio = smoothDistance / 2.5
      
      // 计算透明度：线性过渡
      const opacity = Math.max(0.2, 1 - distanceRatio * 0.8)
      
      // 计算缩放：线性过渡
      const scale = Math.max(0.7, 1 - distanceRatio * 0.3)
      
      // 计算字体大小：线性过渡
      const fontSize = Math.max(14, 24 - distanceRatio * 10)
      
      // 简化字体粗细计算
      let fontWeight: string
      if (smoothDistance < 0.5) {
        fontWeight = '700'
      } else if (smoothDistance < 1.0) {
        fontWeight = '600'
      } else if (smoothDistance < 1.5) {
        fontWeight = '500'
      } else {
        fontWeight = '400'
      }
      
      // 简化颜色计算
      let color: string
      if (smoothDistance < 0.5) {
        color = '$color12'
      } else if (smoothDistance < 1.0) {
        color = '$color11'
      } else if (smoothDistance < 1.5) {
        color = '$color10'
      } else {
        color = '$color9'
      }
      
      return {
        opacity,
        scale,
        fontSize,
        fontWeight,
        color,
        // 预计算可见性，避免渲染屏幕外的元素
        isVisible: smoothDistance < 2.5
      }
    })
  }, [items, translateY, itemHeight, centerIndex])

  return (
    <View
      ref={containerRef}
      height={height}
      width={60}
      position="relative"
      overflow="hidden"
      onPointerDown={handlePointerStart}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onWheel={handleWheel}
      style={{ 
        userSelect: 'none',
        touchAction: 'none' // 防止浏览器默认的触摸行为
      }}
    >
      {/* 选中项覆盖层 */}
      <View
        position="absolute"
        top={itemHeight * centerIndex}
        height={itemHeight}
        width="100%"
        backgroundColor="$color5"
        borderRadius="$3"
        borderWidth={1}
        borderColor="$color10"
        zIndex={1}
        opacity={0.4}
      />
      
      {/* 渐变遮罩 - 顶部 */}
      <View
        position="absolute"
        height={itemHeight * centerIndex}
        zIndex={2}
      />
      
      {/* 渐变遮罩 - 底部 */}
      <View
        position="absolute"
        height={itemHeight * centerIndex}
        width="100%"
        zIndex={2}
      />

      {/* 滚动内容 */}
      <View
        position="absolute"
        width="100%"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: (isDragging || isInertiaScrolling) ? 'none' : 'transform 300ms cubic-bezier(0.25, 0.8, 0.25, 1)'
        }}
      >
        {items.map((item, index) => {
          const { opacity, scale, fontSize, fontWeight, color, isVisible } = itemStyles[index]
          
          // 跳过不可见的元素以提高性能
          if (!isVisible) {
            return <View key={item.value} height={itemHeight} width="100%" />
          }
          
          return (
            <View
              key={item.value}
              height={itemHeight}
              width="100%"
              justifyContent="center"
              alignItems="center"
              style={{
                opacity,
                transform: `scale(${scale})`,
                transition: (isDragging || isInertiaScrolling) ? 'none' : 'all 300ms cubic-bezier(0.25, 0.8, 0.25, 1)'
              }}
            >
              <Text
                fontSize={fontSize}
                fontWeight={fontWeight}
                color={color}
                style={{
                  transition: (isDragging || isInertiaScrolling) ? 'none' : 'all 300ms cubic-bezier(0.25, 0.8, 0.25, 1)',
                  textAlign: 'center',
                  width: '100%'
                }}
              >
                {item.display}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

export const TimePicker: React.FC<TimePickerProps> = ({
  isOpen,
  onClose,
  value,
  onSave,
  title
}) => {
  const [selectedHour, setSelectedHour] = useState(value.split(':')[0] || '00')
  const [selectedMinute, setSelectedMinute] = useState(value.split(':')[1] || '00')

  const hours = generateHours()
  const minutes = generateMinutes()

  const handleSave = () => {
    const timeValue = `${selectedHour}:${selectedMinute}`
    onSave(timeValue)
    onClose()
  }

  const handleCancel = () => {
    // 重置为原始值
    setSelectedHour(value.split(':')[0] || '00')
    setSelectedMinute(value.split(':')[1] || '00')
    onClose()
  }

  // 当 value 改变时更新内部状态
  useEffect(() => {
    const [hour, minute] = value.split(':')
    if (hour && minute) {
      setSelectedHour(hour)
      setSelectedMinute(minute)
    }
  }, [value])

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleCancel()
        }
      }}
      disableDrag
      snapPointsMode='fit'
    >
      <Sheet.Handle 
        bg='$color4'
        mb='$3'
        borderRadius="$2"
      />
      <Sheet.Overlay
        animation="lazy"
        backgroundColor="$shadow6"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame 
        backgroundColor="$background"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
      >
        {/* Header */}
        <YStack p="$4" gap="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <Button
              size="$3"
              variant="outlined"
              icon={X}
              onPress={handleCancel}
            >
              取消
            </Button>
            
            <Text fontSize="$5" fontWeight="600" color="$color12">
              {title}
            </Text>
            
            <Button
              size="$3"
              theme="accent"
              icon={Check}
              onPress={handleSave}
              fontWeight={600}
            >
              确定
            </Button>
          </XStack>

          {/* 时间选择器 */}
          <XStack justifyContent="center" alignItems="center" gap="$4" py="$4">
            <WheelPicker
              items={hours}
              selectedValue={selectedHour}
              onValueChange={setSelectedHour}
              height={300}
            />
            
            <Text fontSize="$6" fontWeight="600" color="$color12">
              :
            </Text>
            
            <WheelPicker
              items={minutes}
              selectedValue={selectedMinute}
              onValueChange={setSelectedMinute}
              height={300}
            />
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}