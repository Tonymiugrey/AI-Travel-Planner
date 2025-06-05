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
  
  // 处理容器大小调整
  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout
    setContainerWidth(width)
  }

  // 滑动过程中实时更新指示器
  const handleScroll = (event: any) => {
    if (containerWidth === 0) return
    
    const offsetX = event.nativeEvent.contentOffset.x
    setScrollOffset(offsetX) // 记录滚动偏移用于调试
    
    const newIndex = Math.round(offsetX / containerWidth)
    const clampedIndex = Math.max(0, Math.min(newIndex, cards.length - 1))
    
    // 实时更新内部索引，让分页指示器跟随滚动
    if (clampedIndex !== internalIndex) {
      setInternalIndex(clampedIndex)
      console.log('滚动更新索引:', clampedIndex, 'offsetX:', offsetX)
    }
  }

  // 滑动结束处理
  const handleScrollEnd = (event: any) => {
    if (containerWidth === 0) return
    
    const offsetX = event.nativeEvent.contentOffset.x
    const newIndex = Math.round(offsetX / containerWidth)
    const clampedIndex = Math.max(0, Math.min(newIndex, cards.length - 1))
    
    console.log('滑动结束:', { offsetX, newIndex, clampedIndex, currentIndex, internalIndex })
    
    // 确保内部索引是最新的
    setInternalIndex(clampedIndex)
    
    // 只有当索引真正发生变化时才调用回调
    if (clampedIndex !== currentIndex) {
      onCardChange?.(clampedIndex)
      console.log('更新索引:', clampedIndex)
    }
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
          onScroll={handleScroll}
          onScrollEndDrag={handleScrollEnd}
          scrollEventThrottle={16}
          decelerationRate="fast"
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
                disabled
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
