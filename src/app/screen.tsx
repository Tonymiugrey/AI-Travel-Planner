import { useState, useEffect } from 'react'
import {
  YStack,
  H1,
  Text,
  Separator,
  XStack,
  Button,
  ToggleGroup,
  styled,
} from 'tamagui'
import { CardCarousel } from './CardCarousel'
import { travelCardsData } from '../data/travelData'

export function HomeScreen() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [currentCard, setCurrentCard] = useState(travelCardsData[0])
  const [selectedDay, setSelectedDay] = useState<'Day 1' | 'Day 2'>('Day 1')

  // 获取当前选中日期的卡片
  const currentDayCards = travelCardsData.filter(card => card.day === selectedDay)

  // 根据当前时间设置默认日期和卡片索引
  useEffect(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // getMonth() 返回 0-11，需要 +1
    const currentDate = now.getDate()
    
    // 只有在2025年6月7号或8号才根据时间自动更新
    if (currentYear === 2025 && currentMonth === 6 && (currentDate === 7 || currentDate === 8)) {
      // 判断当前是第几天
      const currentDay = currentDate === 8 ? 'Day 2' : 'Day 1'
      setSelectedDay(currentDay)
      
      const currentCards = travelCardsData.filter(card => card.day === currentDay)
      
      // 在当天的卡片中找到当前时间对应的卡片
      let foundIndex = 0
      for (let i = 0; i < currentCards.length; i++) {
        const timeRange = currentCards[i].time
        if (timeRange.includes('-')) {
          const [startTime] = timeRange.split('-')
          const [hour, minute] = startTime.split(':').map(Number)
          const cardStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute)
          
          if (now >= cardStartTime) {
            foundIndex = i
          } else {
            break
          }
        }
      }
      
      if (currentCards.length > 0) {
        setCurrentCard(currentCards[foundIndex])
        setCurrentCardIndex(foundIndex)
      }
    } else {
      // 其他日期都显示 Day 1 的第一张卡片
      setSelectedDay('Day 1')
      const day1Cards = travelCardsData.filter(card => card.day === 'Day 1')
      if (day1Cards.length > 0) {
        setCurrentCard(day1Cards[0])
        setCurrentCardIndex(0)
      }
    }
  }, [])

  // 切换日期
  const switchDay = (value: 'Day 1' | 'Day 2') => {
    setSelectedDay(value)
    const dayCards = travelCardsData.filter(card => card.day === value)
    if (dayCards.length > 0) {
      setCurrentCard(dayCards[0])
      setCurrentCardIndex(0)
    }
  }

  // 处理卡片变化的回调函数
  const handleCardChange = (index: number) => {
    setCurrentCardIndex(index)
    const dayCards = travelCardsData.filter(card => card.day === selectedDay)
    if (dayCards[index]) {
      setCurrentCard(dayCards[index])
    }
  }

  const ToggleItem = styled(ToggleGroup.Item, {
    color: '$color10',

    focusStyle: {
      color: '$color1',
      backgroundColor: '$color12',
    },
  })

  return (
    <YStack 
      flex={1} 
      overflow="hidden" 
      height="100vh" 
      width="100vw" 
      position="fixed" 
      bg='$background'
      top={0} 
      left={0}
      style={{
        height: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        width: 'calc(100vw - env(safe-area-inset-left) - env(safe-area-inset-right))',
        marginTop: 'env(safe-area-inset-top)',
        marginLeft: 'env(safe-area-inset-left)',
      }}
    >
      {/* Fixed Header */}
      <YStack
        position="relative"
        p="$5"
        flexShrink={0}
      >
        {/* Main Content */}
        <YStack gap="$2" mt={'$4'}>
          <H1>
            南京之旅
          </H1>

          <Text fontSize="$4" color="$color10" fontWeight="500">
            2025年6月7-8日
          </Text>
          

          <Text fontSize="$2" color="$color9">
            将根据时间自动展示当前的行程卡片
          </Text>
        </YStack>
      </YStack>

      {/* Day Selector and Section Title */}
      <YStack px="$7" gap="$3" flexShrink={0}>
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$5" color="$color11" fontWeight="600">
            {selectedDay === 'Day 1' ? '第一天行程' : '第二天行程'}
          </Text>
          <XStack gap="$2">
            <Button
              size="$3"
              fontWeight={selectedDay === 'Day 1' ? 500 : 400}
              variant={selectedDay === 'Day 1' ? "filled" : "outlined"}
              onPress={() => switchDay('Day 1')}
              
              animation="medium"
              animateOnly={['backgroundColor', 'borderColor', 'color']}
              backgroundColor={selectedDay === 'Day 1' ? '$color9' : 'transparent'}
              borderColor={selectedDay === 'Day 1' ? '$color10' : '$borderColor'}
              borderWidth={1.5}
              color={selectedDay === 'Day 1' ? '$color1' : '$color10'}
              hoverStyle={{
                backgroundColor: selectedDay === 'Day 1' ? '$color9' : 'transparent',
                borderColor: selectedDay === 'Day 1' ? '$color10' : '$borderColor',
                color: selectedDay === 'Day 1' ? '$color1' : '$color10',
              }}
            >
              Day 1
            </Button>
            <Button
              size="$3"
              fontWeight={selectedDay === 'Day 2' ? 500 : 400}
              variant={selectedDay === 'Day 2' ? "filled" : "outlined"}
              onPress={() => switchDay('Day 2')}
              animation="medium"
              animateOnly={['backgroundColor', 'borderColor', 'color']}
              backgroundColor={selectedDay === 'Day 2' ? '$color9' : 'transparent'}
              borderColor={selectedDay === 'Day 2' ? '$color10' : '$borderColor'}
              borderWidth={1.5}
              color={selectedDay === 'Day 2' ? '$color1' : '$color10'}
              hoverStyle={{
                backgroundColor: selectedDay === 'Day 2' ? '$color9' : 'transparent',
                borderColor: selectedDay === 'Day 2' ? '$color10' : '$borderColor',
                color: selectedDay === 'Day 2' ? '$color1' : '$color10',
              }}
            >
              Day 2
            </Button>
          </XStack>
        </XStack>
        <Separator />
      </YStack>

      {/* Fixed Card Carousel */}
      <YStack flex={1} overflow="hidden">
        <CardCarousel 
          cards={currentDayCards} 
          onCardChange={handleCardChange}
          currentIndex={currentCardIndex}
        />
      </YStack>
    </YStack>
  )
}
