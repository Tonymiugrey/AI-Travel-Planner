import { useState, useEffect } from 'react'
import {
  ScrollView,
  YStack,
  H1,
  Text,
  Button,
  XStack,
  ToggleGroup,
  styled,
  Spinner,
  Separator,
} from 'tamagui'
import { Settings, Plus } from '@tamagui/lucide-icons'
import { CardCarousel } from '../components/CardCarousel'
import { DebugSettings } from '../components/DebugSettings'
import { EditCardSheet } from '../components/EditCardSheet'
import { DeleteConfirmSheet } from '../components/DeleteConfirmSheet'
import { useData } from '../contexts/DataContext'
import { TravelCardData } from '../data/travelData'

export function HomeScreen() {
  const { travelCards, isLoading, error, refreshData, useLocalData, setUseLocalData, updateCard, createCard, deleteCard } = useData()
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [currentCard, setCurrentCard] = useState(travelCards[0])
  const [selectedDay, setSelectedDay] = useState<'Day 1' | 'Day 2'>('Day 1')
  const [showDebugSettings, setShowDebugSettings] = useState(false)

  // EditCardSheet 相关状态
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<TravelCardData | null>(null)
  const [isCreatingNewCard, setIsCreatingNewCard] = useState(false)

  // 删除确认 Sheet 相关状态
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false)
  const [deletingCard, setDeletingCard] = useState<TravelCardData | null>(null)

  // 过滤非 planB 的卡片
  const filteredCards = travelCards.filter(card => !card.isPlanB)
  
  // 获取当前选中日期的卡片并按时间排序
  const currentDayCards = filteredCards
    .filter(card => card.day === selectedDay)
    .sort((a, b) => {
      // 解析时间字符串进行排序
      const getTimeValue = (timeStr: string) => {
        if (!timeStr) return 0
        
        // 处理时间格式：支持 "09:00-12:42" 或 "09:00" 等格式
        const startTime = timeStr.includes('-') ? timeStr.split('-')[0] : timeStr
        const [hours, minutes] = startTime.split(':').map(Number)
        
        // 转换为分钟数进行比较
        return hours * 60 + (minutes || 0)
      }
      
      return getTimeValue(a.time) - getTimeValue(b.time)
    })
  
  // 添加调试信息
  console.log('当前状态:', {
    selectedDay,
    filteredCardsLength: filteredCards.length,
    currentDayCardsLength: currentDayCards.length,
    travelCardsLength: travelCards.length
  })

  // 用于标记是否已经初始化过
  const [isInitialized, setIsInitialized] = useState(false)
  // 用于跟踪正在编辑的卡片ID，以便保存后重新定位
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  // 用于标记是否需要重新定位（只在保存后设置为true）
  const [shouldReposition, setShouldReposition] = useState(false)
  // 用于标记是否正在创建planB
  const [isCreatingPlanB, setIsCreatingPlanB] = useState(false)
  // 用于存储创建planB时的原始卡片
  const [planACard, setPlanACard] = useState<TravelCardData | null>(null)

  // 根据当前时间设置默认日期和卡片索引（仅在初始化时执行一次）
  useEffect(() => {
    if (filteredCards.length === 0 || isInitialized) return // 等待数据加载或已经初始化过

    console.log('初始化应用状态...')
    
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // getMonth() 返回 0-11，需要 +1
    const currentDate = now.getDate()
    
    let initialDay: 'Day 1' | 'Day 2' = 'Day 1'
    
    // 只有在2025年6月7号或8号才根据时间自动更新
    if (currentYear === 2025 && currentMonth === 6 && (currentDate === 7 || currentDate === 8)) {
      // 判断当前是第几天
      initialDay = currentDate === 8 ? 'Day 2' : 'Day 1'
    }
    
    setSelectedDay(initialDay)
    
    // 获取当前日期的卡片（已按时间排序）
    const currentCards = filteredCards
      .filter(card => card.day === initialDay)
      .sort((a, b) => {
        const getTimeValue = (timeStr: string) => {
          if (!timeStr) return 0
          const startTime = timeStr.includes('-') ? timeStr.split('-')[0] : timeStr
          const [hours, minutes] = startTime.split(':').map(Number)
          return hours * 60 + (minutes || 0)
        }
        return getTimeValue(a.time) - getTimeValue(b.time)
      })
    
    if (currentCards.length > 0) {
      let foundIndex = 0
      
      // 在特定日期才根据时间查找当前应该显示的卡片
      if (currentYear === 2025 && currentMonth === 6 && (currentDate === 7 || currentDate === 8)) {
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
      }
      
      setCurrentCard(currentCards[foundIndex])
      setCurrentCardIndex(foundIndex)
    }
    
    setIsInitialized(true)
    console.log('应用状态初始化完成，初始日期:', initialDay)
  }, [filteredCards, isInitialized]) // 依赖 filteredCards 和 isInitialized

  // 监听卡片数据变化，如果有正在编辑的卡片保存了，重新定位到新位置
  useEffect(() => {
    console.log('重新定位useEffect检查:', {
      editingCardId,
      isInitialized,
      shouldReposition,
      shouldTrigger: editingCardId && isInitialized && shouldReposition
    })
    
    if (editingCardId && isInitialized && shouldReposition) {
      console.log('触发重新定位，卡片ID:', editingCardId)
      
      // 重新获取排序后的当前日期卡片
      const updatedDayCards = filteredCards
        .filter(card => card.day === selectedDay)
        .sort((a, b) => {
          const getTimeValue = (timeStr: string) => {
            if (!timeStr) return 0
            const startTime = timeStr.includes('-') ? timeStr.split('-')[0] : timeStr
            const [hours, minutes] = startTime.split(':').map(Number)
            return hours * 60 + (minutes || 0)
          }
          return getTimeValue(a.time) - getTimeValue(b.time)
        })
      
      console.log('重新排序后的卡片:', updatedDayCards.map((card, idx) => `${idx}: ${card.time} - ${card.title} (${card.id})`))
      
      // 找到编辑卡片的新位置
      const newIndex = updatedDayCards.findIndex(card => card.id === editingCardId)
      
      if (newIndex !== -1) {
        console.log(`卡片 ${editingCardId} 重新定位到位置 ${newIndex}`)
        console.log('当前currentCardIndex:', currentCardIndex, '新的newIndex:', newIndex)
        setCurrentCardIndex(newIndex)
        setCurrentCard(updatedDayCards[newIndex])
        console.log('已调用setCurrentCardIndex和setCurrentCard')
      } else {
        console.log('未找到编辑的卡片ID:', editingCardId)
      }
      
      // 清除编辑标记和重新定位标记
      setEditingCardId(null)
      setShouldReposition(false)
      console.log('已清除编辑标记和重新定位标记')
    }
  }, [travelCards, editingCardId, selectedDay, filteredCards, isInitialized, shouldReposition, currentCardIndex])

  // 切换日期
  const switchDay = (value: 'Day 1' | 'Day 2') => {
    console.log('切换到:', value)
    console.log('当前选中日期:', selectedDay)
    console.log('过滤后的卡片总数:', filteredCards.length)
    
    // 获取指定日期的卡片并按时间排序
    const dayCards = filteredCards
      .filter(card => card.day === value)
      .sort((a, b) => {
        const getTimeValue = (timeStr: string) => {
          if (!timeStr) return 0
          const startTime = timeStr.includes('-') ? timeStr.split('-')[0] : timeStr
          const [hours, minutes] = startTime.split(':').map(Number)
          return hours * 60 + (minutes || 0)
        }
        return getTimeValue(a.time) - getTimeValue(b.time)
      })
    
    console.log(`${value} 的卡片数量:`, dayCards.length)
    console.log(`${value} 的卡片:`, dayCards.map(card => `${card.time} - ${card.title}`))
    
    setSelectedDay(value)
    if (dayCards.length > 0) {
      setCurrentCard(dayCards[0])
      setCurrentCardIndex(0)
      console.log('设置当前卡片:', dayCards[0].title)
    }
  }

  // 处理卡片变化的回调函数
  const handleCardChange = (index: number) => {
    setCurrentCardIndex(index)
    // 使用已经排序的 currentDayCards
    if (currentDayCards[index]) {
      setCurrentCard(currentDayCards[index])
    }
  }

  // 处理编辑卡片
  const handleEditCard = (card: TravelCardData) => {
    setEditingCard(card)
    setEditingCardId(card.id) // 记录正在编辑的卡片ID
    setEditSheetOpen(true)
  }

  // 处理关闭编辑 - 统一通过editSheetOpen控制
  const handleCloseEdit = () => {
    console.log('handleCloseEdit called')
    setEditSheetOpen(false)
    setIsCreatingNewCard(false)
    setIsCreatingPlanB(false)
    setEditingCard(null)
    setPlanACard(null)
    // 注意：不在这里清除 editingCardId 和 shouldReposition
    // 这些会在重新定位 useEffect 中清除，以确保重新定位能够正确执行
  }

  // 处理保存编辑
  const handleSaveEdit = async (updatedCard: TravelCardData) => {
    if (isCreatingNewCard) {
      await handleCreateSave(updatedCard)
      // 创建成功后关闭Sheet
      setEditSheetOpen(false)
    } else if (isCreatingPlanB) {
      await handleCreatePlanBSave(updatedCard)
      // 创建成功后关闭Sheet
      setEditSheetOpen(false)
    } else {
      console.log('保存编辑，准备重新定位卡片:', updatedCard.id)
      
      // 保存编辑，并标记需要重新定位
      await updateCard(updatedCard)
      console.log('卡片保存完成，设置重新定位标记')
      setShouldReposition(true) // 设置重新定位标记
      setEditSheetOpen(false)
      console.log('编辑Sheet已关闭，等待重新定位...')
    }
  }

  // 处理删除请求 - 打开删除确认Sheet
  const handleDeleteRequest = (card: TravelCardData) => {
    console.log('handleDeleteRequest 被调用', card)
    setDeletingCard(card)
    setDeleteSheetOpen(true)
  }

  // 处理关闭删除确认Sheet
  const handleCloseDeleteConfirm = () => {
    setDeleteSheetOpen(false)
  }

  // 处理确认删除
  const handleConfirmDelete = async (card: TravelCardData) => {
    try {
      console.log('开始删除卡片:', card.title, card.id)
      
      // 检查是否有关联的planB
      if (!card.isPlanB) {
        const relatedPlanB = travelCards.find(c => 
          c.isPlanB && c.planAId === card.id
        )
        if (relatedPlanB) {
          console.log('发现关联的planB:', relatedPlanB.title, '将被提升为planA')
        }
      }
      
      // 删除卡片（DataContext中会处理planB提升逻辑）
      await deleteCard(card.id)
      
      console.log('卡片删除成功')
      
      // 关闭删除确认Sheet
      setDeleteSheetOpen(false)
      
      // 如果编辑的是被删除的卡片，也关闭编辑Sheet
      if (editingCard && editingCard.id === card.id) {
        setEditSheetOpen(false)
        setEditingCard(null)
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  // 处理新建卡片
  const handleCreateCard = () => {
    console.log('开始新建卡片')
    // 创建一个新的空卡片模板
    const newCardTemplate: TravelCardData = {
      id: `temp-${Date.now()}`, // 临时ID，保存时会生成真实ID
      title: '',
      day: selectedDay, // 默认为当前选中的日期
      time: '',
      category: '',
      description: [],
      tips: [],
      highlights: '',
      departureTime: '',
      arrivalTime: '',
      duration: '',
      amapUrl: '',
      transportation: ''
    }
    
    setEditingCard(newCardTemplate)
    setIsCreatingNewCard(true)
    setEditSheetOpen(true)
  }

  // 处理新建卡片的保存
  const handleCreateSave = async (newCard: TravelCardData) => {
    try {
      // 生成新的ID，格式：day1-card0, day1-card1, day2-card1 等
      const dayNumber = newCard.day === 'Day 1' ? '1' : '2'
      
      // 找到当前日期下最大的卡片索引
      const existingCards = travelCards.filter(card => 
        card.day === newCard.day && !card.isPlanB
      )
      
      // 从现有卡片ID中提取数字索引，找到最大值
      let maxIndex = -1
      existingCards.forEach(card => {
        const match = card.id.match(/day\d+-card(\d+)/)
        if (match) {
          const index = parseInt(match[1])
          if (index > maxIndex) {
            maxIndex = index
          }
        }
      })
      
      // 新卡片的索引为最大值+1
      const newIndex = maxIndex + 1
      
      const cardWithId = {
        ...newCard,
        id: `day${dayNumber}-card${newIndex}`
      }
      
      // 使用createCard函数创建新卡片
      await createCard(cardWithId)
      
      console.log('新建卡片成功:', cardWithId.title)
      
      // 重置状态
      setIsCreatingNewCard(false)
      setEditingCard(null)
      setEditSheetOpen(false)
    } catch (error) {
      console.error('新建卡片失败:', error)
    }
  }

  // 处理新建planB
  const handleCreatePlanB = (originalCard: TravelCardData) => {
    console.log('开始新建planB:', originalCard.title)
    
    // 创建一个基于原卡片的planB模板，只保留时间段，其他字段清空
    const planBTemplate: TravelCardData = {
      id: `${originalCard.id}-planb`, // 临时ID，保存时会生成真实ID
      title: '', // 清空标题
      day: originalCard.day, // 保留日期
      time: originalCard.time, // 保留时间段
      category: '', // 清空分类
      description: [], // 清空描述
      tips: [], // 清空提示
      highlights: '', // 清空亮点
      departureTime: '', // 清空出发时间
      arrivalTime: '', // 清空到达时间
      duration: '', // 清空持续时间
      amapUrl: '', // 清空地图链接
      transportation: '', // 清空交通方式
      isPlanB: true,
      planAId: originalCard.id
    }
    
    setEditingCard(planBTemplate)
    setPlanACard(originalCard)
    setIsCreatingPlanB(true)
    setEditSheetOpen(true)
  }

  // 处理新建planB的保存
  const handleCreatePlanBSave = async (newPlanB: TravelCardData) => {
    try {
      if (!planACard) {
        throw new Error('未找到原始卡片信息')
      }

      // 生成planB的ID，格式：原卡片ID-planb
      const planBWithId = {
        ...newPlanB,
        id: `${planACard.id}-planb`,
        isPlanB: true,
        planAId: planACard.id
      }
      
      // 使用createCard函数创建planB卡片
      await createCard(planBWithId)
      
      console.log('新建planB成功:', planBWithId.title)
      
      // 重置状态
      setIsCreatingPlanB(false)
      setPlanACard(null)
      setEditingCard(null)
      setEditSheetOpen(false)
    } catch (error) {
      console.error('新建planB失败:', error)
    }
  }

  // 如果显示 Debug 设置
  if (showDebugSettings) {
    return <DebugSettings onBack={() => setShowDebugSettings(false)} />
  }

  // 加载状态
  if (isLoading) {
    return (
      <YStack 
        flex={1} 
        justifyContent="center" 
        alignItems="center" 
        bg="$background"
        gap="$4"
      >
        <Spinner size="large" color="$color10" />
        <Text fontSize="$4" color="$color10">
          {useLocalData ? '加载本地数据...' : '从 LeanCloud 加载数据...'}
        </Text>
      </YStack>
    )
  }

  // 错误状态
  if (error && filteredCards.length === 0) {
    return (
      <YStack 
        flex={1} 
        justifyContent="center" 
        alignItems="center" 
        bg="$background"
        gap="$4"
        px="$4"
      >
        <Text fontSize="$5" color="$red10" textAlign="center">
          数据加载失败
        </Text>
        <Text fontSize="$3" color="$color10" textAlign="center">
          {error}
        </Text>
        <Button 
          onPress={refreshData}
          theme="accent"
          size="$4"
        >
          重试
        </Button>
      </YStack>
    )
  }

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
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack gap="$2" flex={1}>
              <XStack 
                justifyContent="space-between" 
                alignItems="center" 
                gap="$2"
              >
              <H1 fontWeight="700">
                南京之旅
              </H1>
                <XStack gap="$3">
                  <Button
                    size="$3"
                    circular
                    theme="accent"
                    icon={Plus}
                    onPress={handleCreateCard}
                  >
                  </Button>
                  <Button
                    size="$3"
                    circular
                    variant="outlined"
                    icon={Settings}
                    onPress={() => setShowDebugSettings(true)}
                    borderColor="$borderColor"
                    color="$color10"
                  >
                  </Button>
                </XStack>
                </XStack>

              <Text fontSize="$4" color="$color10" fontWeight="500">
                2025年6月7日-8日
              </Text>
              
              <Text fontSize="$2" color="$color9">
                将根据时间自动展示当前的行程卡片
              </Text>
              
              {error && (
                <Text fontSize="$2" color="$accent10">
                  {error}
                </Text>
              )}
            </YStack>
          </XStack>
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
              backgroundColor={selectedDay === 'Day 1' ? '$color8' : 'transparent'}
              borderColor={selectedDay === 'Day 1' ? '$color9' : '$borderColor'}
              borderWidth={1.5}
              color={selectedDay === 'Day 1' ? '$color1' : '$color9'}
              hoverStyle={{
                backgroundColor: selectedDay === 'Day 1' ? '$color8' : 'transparent',
                borderColor: selectedDay === 'Day 1' ? '$color9' : '$borderColor',
                color: selectedDay === 'Day 1' ? '$color1' : '$color9',
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
              backgroundColor={selectedDay === 'Day 2' ? '$color8' : 'transparent'}
              borderColor={selectedDay === 'Day 2' ? '$color9' : '$borderColor'}
              borderWidth={1.5}
              color={selectedDay === 'Day 2' ? '$color1' : '$color9'}
              hoverStyle={{
                backgroundColor: selectedDay === 'Day 2' ? '$color8' : 'transparent',
                borderColor: selectedDay === 'Day 2' ? '$color9' : '$borderColor',
                color: selectedDay === 'Day 2' ? '$color1' : '$color9',
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
          allCards={travelCards}
          onCardChange={handleCardChange}
          currentIndex={currentCardIndex}
          onUpdateCard={updateCard}
          onDeleteCard={deleteCard}
          onEdit={handleEditCard}
          onCreatePlanB={handleCreatePlanB}
        />
      </YStack>

      {/* Edit Card Sheet */}
      <EditCardSheet
        isOpen={editSheetOpen}
        onClose={handleCloseEdit}
        card={editingCard}
        mode={isCreatingNewCard ? 'create' : isCreatingPlanB ? 'createPlanB' : 'edit'}
        onSave={handleSaveEdit}
        onDelete={handleDeleteRequest}
      />

      {/* Delete Confirmation Sheet */}
      <DeleteConfirmSheet
        isOpen={deleteSheetOpen}
        onClose={handleCloseDeleteConfirm}
        card={deletingCard}
        onConfirm={handleConfirmDelete}
        allCards={travelCards}
      />
    </YStack>
  )
}
