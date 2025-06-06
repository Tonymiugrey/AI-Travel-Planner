import React, { useRef, useEffect, useState } from 'react'
import { XStack, YStack, Button, ScrollView } from 'tamagui'
import { TravelCard } from './TravelCard'
import { TravelCardData } from '../data/travelData'

interface CardCarouselProps {
  cards: TravelCardData[]
  allCards?: TravelCardData[] // 新增：所有卡片数据，用于查找 planB
  onCardChange?: (index: number) => void
  currentIndex?: number
  onUpdateCard?: (updatedCard: TravelCardData) => void // 新增：更新卡片回调
  onDeleteCard?: (cardId: string) => void // 新增：删除卡片回调
  onEdit?: (card: TravelCardData) => void // 新增：编辑卡片回调
  onCreatePlanB?: (card: TravelCardData) => void // 新增：创建planB回调
}

export const CardCarousel: React.FC<CardCarouselProps> = ({ 
  cards, 
  allCards = [], 
  onCardChange, 
  currentIndex = 0,
  onUpdateCard,
  onDeleteCard,
  onEdit,
  onCreatePlanB
}) => {
  const scrollViewRef = useRef<any>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [internalIndex, setInternalIndex] = useState(currentIndex) // 添加内部索引状态
  const [scrollOffset, setScrollOffset] = useState(0) // 添加滚动偏移调试
  const [isScrolling, setIsScrolling] = useState(false) // 添加滚动状态跟踪
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null) // 防抖定时器
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])
  
  // 处理容器大小调整
  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout
    setContainerWidth(width)
  }

  // 滑动开始处理
  const handleScrollBegin = () => {
    setIsScrolling(true)
    // 清除之前的防抖定时器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
  }

  // 滑动过程中实时更新指示器
  const handleScroll = (event: any) => {
    if (containerWidth === 0) return
    
    const offsetX = event.nativeEvent.contentOffset.x
    setScrollOffset(offsetX) // 记录滚动偏移用于调试
    
    // 使用更精确的索引计算，避免跳跃
    const rawIndex = offsetX / containerWidth
    const newIndex = Math.round(rawIndex)
    const clampedIndex = Math.max(0, Math.min(newIndex, cards.length - 1))
    
    // 只有在索引真正改变且在合理范围内时才更新
    if (clampedIndex !== internalIndex && Math.abs(clampedIndex - internalIndex) <= 1) {
      setInternalIndex(clampedIndex)
      console.log('滚动更新索引:', clampedIndex, 'offsetX:', offsetX, 'rawIndex:', rawIndex)
    }
  }

  // 滑动结束处理 - 确保精确对齐
  const handleScrollEnd = (event: any) => {
    if (containerWidth === 0) return
    
    // 设置防抖，避免快速连续触发
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
      
      const offsetX = event.nativeEvent.contentOffset.x
      const rawIndex = offsetX / containerWidth
      
      // 使用更保守的索引计算，确保一次只移动一张
      let targetIndex: number
      
      // 如果偏移超过一半，则移动到下一张；否则保持当前张
      if (Math.abs(rawIndex - Math.round(rawIndex)) < 0.1) {
        // 如果已经很接近整数位置，直接使用四舍五入
        targetIndex = Math.round(rawIndex)
      } else {
        // 根据滑动方向决定目标索引
        if (rawIndex > internalIndex) {
          // 向右滑动
          targetIndex = rawIndex - internalIndex > 0.3 ? internalIndex + 1 : internalIndex
        } else {
          // 向左滑动
          targetIndex = internalIndex - rawIndex > 0.3 ? internalIndex - 1 : internalIndex
        }
      }
      
      // 确保索引在有效范围内
      const clampedIndex = Math.max(0, Math.min(targetIndex, cards.length - 1))
      
      console.log('滑动结束:', { 
        offsetX, 
        rawIndex, 
        targetIndex, 
        clampedIndex, 
        currentIndex, 
        internalIndex 
      })
      
      // 如果计算出的索引与当前位置不符，强制滚动到正确位置
      if (Math.abs(offsetX - clampedIndex * containerWidth) > 5) {
        scrollViewRef.current?.scrollTo({
          x: clampedIndex * containerWidth,
          animated: true
        })
      }
      
      // 更新内部索引
      setInternalIndex(clampedIndex)
      
      // 只有当索引真正发生变化时才调用回调
      if (clampedIndex !== currentIndex) {
        onCardChange?.(clampedIndex)
        console.log('更新索引:', clampedIndex)
      }
    }, 100) // 100ms防抖延迟
  }  // 当外部 currentIndex 或 containerWidth 变化时，滚动到对应位置
  useEffect(() => {
    console.log('CardCarousel Effect触发:', { 
      currentIndex, 
      containerWidth, 
      cardsLength: cards.length,
      scrollViewRef: !!scrollViewRef.current 
    })
    
    if (containerWidth > 0 && scrollViewRef.current && cards.length > 0) {
      const validIndex = Math.max(0, Math.min(currentIndex, cards.length - 1))
      console.log('CardCarousel 准备滚动到索引:', validIndex, '目标位置:', validIndex * containerWidth)
      
      // 同时更新内部索引状态，确保分页指示器同步
      setInternalIndex(validIndex)
      
      scrollViewRef.current.scrollTo({
        x: validIndex * containerWidth, 
        animated: containerWidth > 0 // 有宽度时才使用动画
      })
      
      console.log('CardCarousel 滚动命令已发送')
    } else {
      console.log('CardCarousel 滚动条件不满足:', {
        hasContainerWidth: containerWidth > 0,
        hasScrollViewRef: !!scrollViewRef.current,
        hasCards: cards.length > 0
      })
    }
  }, [currentIndex, containerWidth, cards.length])

  return (
    <YStack gap="$4" alignItems="center" justifyContent="center">
      {/* 轮播图容器 */}
      <YStack 
        height={480}
        width="90%"
        onLayout={handleLayout}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={handleScrollBegin} // 添加滚动开始事件
          onScroll={handleScroll}
          onScrollEndDrag={handleScrollEnd}
          onMomentumScrollEnd={handleScrollEnd} // 添加惯性滚动结束事件
          scrollEventThrottle={16}
          decelerationRate="fast"
          bounces={false} // 禁用弹性效果，避免过度滚动
          scrollToOverflowEnabled={false} // 防止滚动超出边界
          snapToInterval={containerWidth} // 确保精确对齐到每页
          snapToAlignment="start" // 对齐方式
        >
          {containerWidth > 0 && cards.map((card) => (
            <YStack 
              key={card.id}
              width={containerWidth}
              height={480}
              p="$4"
            >
              <TravelCard 
                data={card} 
                allCards={allCards} 
                onUpdate={onUpdateCard}
                onDelete={onDeleteCard}
                onEdit={onEdit}
                onCreatePlanB={onCreatePlanB}
              />
            </YStack>
          ))}
        </ScrollView>
      </YStack>

      {/* iPhone风格分页指示器 */}
      {cards.length > 1 && (
        <YStack alignItems="center">
          <XStack gap="$2.5">
            {cards.map((_, index) => (
              <Button
                key={index}
                size="$1"
                bg={index === internalIndex ? '$color9' : '$color4'}
                width={8}
                height={8}
                borderRadius={12}
              />
            ))}
          </XStack>
        </YStack>
      )}
    </YStack>
  )
}
