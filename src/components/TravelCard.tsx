import React, { useState, useEffect } from 'react'
import { Button, Card, Text, XStack, YStack, Sheet, H3, ScrollView, H4 } from 'tamagui'
import { MapPin, Clock, Navigation, Info, X, RotateCcw, Edit3, Plus } from '@tamagui/lucide-icons'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { TravelCardData } from '../data/travelData'

interface TravelCardProps {
  data: TravelCardData
  allCards?: TravelCardData[] // 新增：所有卡片数据，用于查找 planB
  onUpdate?: (updatedCard: TravelCardData) => void // 新增：更新卡片回调
  onDelete?: (cardId: string) => void // 新增：删除卡片回调
  onEdit?: (card: TravelCardData) => void // 新增：编辑卡片回调
  onCreatePlanB?: (card: TravelCardData) => void // 新增：创建planB回调
}

export const TravelCard: React.FC<TravelCardProps> = ({ data, allCards = [], onUpdate, onDelete, onEdit, onCreatePlanB }) => {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<'A' | 'B'>('A')
  const [isFlipping, setIsFlipping] = useState(false)

  // 查找对应的 Plan B 卡片
  const planBCard = allCards.find(card => card.isPlanB && card.planAId === data.id)

  // 从 localStorage 读取和保存 Plan 状态
  useEffect(() => {
    const savedPlan = localStorage.getItem(`travel-card-plan-${data.id}`)
    if (savedPlan === 'B' && planBCard) {
      setCurrentPlan('B')
    } else {
      setCurrentPlan('A')
    }
  }, [data.id, planBCard])

  const savePlanToStorage = (plan: 'A' | 'B') => {
    localStorage.setItem(`travel-card-plan-${data.id}`, plan)
  }

  // 获取当前显示的数据
  const getCurrentData = () => {
    if (currentPlan === 'B' && planBCard) {
      return planBCard
    }
    return data
  }

  const currentData = getCurrentData()

  const handleNavigate = () => {
    const amapUrl = currentData.amapUrl
    // In a real app, you would use Linking.openURL(amapUrl) for React Native
    // or window.open(amapUrl) for web
    if (typeof window !== 'undefined') {
      window.open(amapUrl, '_blank')
    }
  }

  const togglePlan = () => {
    if (isFlipping) return // 防止重复点击
    
    setIsFlipping(true)
    
    // 在动画中间点切换内容和颜色
    setTimeout(() => {
      const newPlan = currentPlan === 'A' ? 'B' : 'A'
      setCurrentPlan(newPlan)
      savePlanToStorage(newPlan) // 保存到 localStorage
    }, 500) // 在动画一半时切换
    
    // 动画结束后重置状态
    setTimeout(() => {
      setIsFlipping(false)
    }, 1500) // 总动画时长
  }

  return (
    <Card
      elevate
      size="$5"
      bordered
      borderColor={currentPlan === 'B' ? "$accent7" : "$borderColor"}
      width="100%"
      height="100%"
      bg={currentPlan === 'B' ? "$accent3" : "$background"}
      shadowColor="$shadow3"
      shadowOffset={{ width: 0, height: 3 }}
      shadowOpacity={0.5}
      shadowRadius={8}
      borderRadius="$6"
      overflow="hidden"
      style={{
        perspective: '1000px',
        transform: isFlipping ? 'rotateY(-180deg)' : 'rotateY(0deg)',
        transition: isFlipping ? 'transform 1.5s cubic-bezier(0.45, 0.56, 0.45, 0.94)' : 'none',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'show',
      }}
    >
        <YStack 
          flex={1} 
          p="$4" 
          gap={"$4"}
          style={{
            transform: isFlipping ? 'scaleX(-1)' : 'scaleX(1)',
            transition: isFlipping ? 'transform 0s linear 0.5s' : 'transform 0s linear',
          }}
        >
            {/* Header */}
            <YStack
                bg={currentPlan === 'B' ? "$accent3" : "$color2"}
                borderTopRightRadius="$6"
                borderTopLeftRadius="$6"
                gap="$4"
            >
                <XStack>
                    <Text
                    fontSize="$3"
                    color={currentPlan === 'B' ? "$accent11" : "$color10"}
                    fontWeight="600"
                    textTransform="uppercase"
                    letterSpacing={1}
                    flex={1}
                    >
                    {data.category}
                    </Text>
                    
                    <XStack gap="$2">
                        {planBCard && (
                            <Text
                                bg={currentPlan === 'B' ? "$accent9" : "$color4"}
                                px="$2"
                                py="$1"
                                fontSize="$1"
                                color={currentPlan === 'B' ? "$accent1" : "$color10"}
                                borderEndEndRadius={"$1"}
                                borderStartStartRadius={"$1"}
                                borderStartEndRadius={"$1"}
                                borderEndStartRadius={"$1"}
                            >
                                Plan {currentPlan}
                            </Text>
                        )}
                        
                        <Text
                            bg={currentPlan === 'B' ? "$accent9" : "$color4"}
                            px="$2"
                            py="$1"
                            fontSize="$1"
                            color={currentPlan === 'B' ? "$accent1" : "$color10"}
                            borderEndEndRadius={"$1"}
                            borderStartStartRadius={"$1"}
                            borderStartEndRadius={"$1"}
                            borderEndStartRadius={"$1"}
                        >
                            {currentData.day} | {currentData.time}
                        </Text>
                    </XStack>
                </XStack>
            </YStack>
                            
            {/* Content */}
            <YStack gap="$3">                
                <YStack gap="$3" >
                    <XStack gap="$2">
                        <XStack gap="$2" flex={1}>
                            <MapPin size={16} color={currentPlan === 'B' ? "$accent11" : "$color11"} />
                            <Text 
                              fontSize="$3" 
                              fontWeight="600" 
                              color={currentPlan === 'B' ? "$accent12" : "$color11"} 
                              flex={1}
                            >
                                {currentData.title}
                            </Text>
                        </XStack>
                        {currentData.transportation && (
                            <Text
                                fontSize="$1"
                                color={currentPlan === 'B' ? "$accent1" : "$color10"}
                                bg={currentPlan === 'B' ? "$accent9" : "$color4"}
                                px="$2"
                                py="$1"
                                borderEndEndRadius={"$1"}
                                borderStartStartRadius={"$1"}
                                borderStartEndRadius={"$1"}
                                borderEndStartRadius={"$1"}
                            >
                                {currentData.transportation}
                            </Text>
                        )}
                    </XStack>
                </YStack>
            </YStack>

            <YStack gap="$3">
                {(currentData.departureTime || currentData.arrivalTime || currentData.duration) && (
                    <YStack gap="$2">
                        <XStack gap="$2">
                            <Clock size={16} color={currentPlan === 'B' ? "$accent11" : "$color11"} />
                            <Text fontSize="$3" fontWeight="600" color={currentPlan === 'B' ? "$accent12" : "$color11"}>
                                时间安排
                            </Text>
                        </XStack>
                        <YStack gap="$1" pl="$5">
                            {currentData.departureTime && (
                                <Text 
                                  fontSize="$2" 
                                  color={currentPlan === 'B' ? "$accent10" : "$color10"}
                                >
                                  出发:    {currentData.departureTime}
                                </Text>
                            )}
                            {currentData.arrivalTime && (
                                 <Text 
                                   fontSize="$2" 
                                   color={currentPlan === 'B' ? "$accent10" : "$color10"}
                                 >
                                   到达:    {currentData.arrivalTime}
                                 </Text>
                            )}
                            {currentData.duration && (
                                <Text 
                                  fontSize="$2" 
                                  color={currentPlan === 'B' ? "$accent10" : "$color10"}
                                >
                                  停留时间:    {currentData.duration}
                                </Text>
                            )}
                        </YStack>
                    </YStack>
                )}
            </YStack>

            <YStack gap="$3">
                {currentData.description && Array.isArray(currentData.description) && currentData.description.length > 0 && (
                    <YStack gap="$2">
                    <Text fontSize="$3" fontWeight="600" color={currentPlan === 'B' ? "$accent12" : "$color11"}>
                        行程描述
                    </Text>
                    {currentData.description.map((item, index) => (
                        <Text
                        key={index}
                        fontSize="$2"
                        color={currentPlan === 'B' ? "$accent10" : "$color10"}
                        numberOfLines={2}
                        >
                        • {item}
                        </Text>
                    ))}
                    </YStack>
                )}

                {currentData.tips && Array.isArray(currentData.tips) && currentData.tips.length > 0 && (
                    <YStack gap="$2">
                    <Text fontSize="$3" fontWeight="600" color={currentPlan === 'B' ? "$accent12" : "$color11"}>
                        小贴士
                    </Text>
                    {currentData.tips.map((item, index) => (
                        <Text
                        key={index}
                        fontSize="$2"
                        color={currentPlan === 'B' ? "$accent10" : "$color10"}
                        numberOfLines={2}
                        >
                        • {item}
                        </Text>
                    ))}
                    </YStack>
                )}
            </YStack>
        </YStack>

        {/* Footer */}
        <YStack
            p="$4"
            bg={currentPlan === 'B' ? "$accent1" : "$color1"}
            borderBottomRightRadius="$6"
            borderBottomLeftRadius="$6"
            style={{
              transform: isFlipping ? 'scaleX(-1)' : 'scaleX(1)',
              transition: isFlipping ? 'transform 0s linear 0.4s' : 'transform 0s linear',
            }}
        >
            <XStack gap="$2">        
              <XStack flex={1} gap="$3">
                  {currentData.amapUrl && (
                    <Button
                    size="$2"
                    icon={Navigation}
                    theme={"accent"}
                    bg={currentPlan === 'B' ? "$accent5" : "$accent3"}
                    //animation="medium"
                    onPress={handleNavigate}
                    fontWeight={600}
                    >
                    导航
                    </Button>
                )}

                {currentData.highlights && (
                    <Button
                    size="$2"
                    theme={currentPlan === 'B' ? 'accent' : 'light'}
                    bg={currentPlan === 'B' ? "$accent5" : "$color4"}
                    icon={Info}
                    onPress={() => setSheetOpen(true)}
                    fontWeight={600}
                    >
                    详细行程
                    </Button>
                )}
              </XStack>

              <Button
                  size="$2"
                  theme={currentPlan === 'B' ? 'accent' : 'light'}
                  bg={currentPlan === 'B' ? "$accent5" : "$color4"}
                  icon={Edit3}
                  onPress={() => onEdit?.(currentData)}
                  fontWeight={600}
              >
              </Button>

              {!planBCard && !data.isPlanB && (
                <Button
                  size="$2"
                  theme={currentPlan === 'B' ? 'accent' : 'light'}
                  bg={currentPlan === 'B' ? "$accent5" : "$color4"}
                  icon={Plus}
                  onPress={() => onCreatePlanB?.(data)}
                  fontWeight={600}
                >
                  新增方案
                </Button>
              )}
              
              {planBCard && (
                  <Button
                  size="$2"
                  theme={currentPlan === 'B' ? 'accent' : 'light'}
                  bg={currentPlan === 'B' ? "$accent5" : "$color4"}
                  icon={RotateCcw}
                  onPress={togglePlan}
                  fontWeight={600}
                  disabled={isFlipping}
                  >
                  切换方案
                  </Button>
              )}
            </XStack>
        </YStack>

      {/* Sheet Modal */}
      <Sheet 
        modal={true} 
        open={sheetOpen} 
        onOpenChange={setSheetOpen} 
        dismissOnSnapToBottom 
        forceRemoveScrollEnabled={sheetOpen}
        snapPoints={[90]}
      >
        <Sheet.Overlay         
          animation="lazy"
          backgroundColor="$shadow6"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}/>
        <Sheet.Handle 
          bg='$color4'
          mb='$3'
          borderRadius="$2"
        />
        <Sheet.Frame 
          p="$4" 
          gap="$4" 
          bg="$background"
          borderTopLeftRadius="$6"
          borderTopRightRadius="$6"
        >

        <YStack gap="$4" flex={1}>
            <H3 color="$color12" mt='$2' flex={1}>{currentData.title}</H3>
            
            <Sheet.ScrollView flex={1} mb='$2'>
              <YStack gap="$2" p="$2">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    p: ({ children }) => (
                      <YStack mb="$2">
                        <Text 
                          fontSize="$3" 
                          color="$color11" 
                          lineHeight="$2"
                        >
                          {children}
                        </Text>
                      </YStack>
                    ),
                    h1: ({ children }) => (
                      <YStack mb="$3">
                        <Text 
                          fontSize="$6" 
                          fontWeight="bold"
                          color="$color12"
                        >
                          {children}
                        </Text>
                      </YStack>
                    ),
                    h2: ({ children }) => (
                      <YStack mb="$3">
                        <Text 
                          fontSize="$5" 
                          fontWeight="bold"
                          color="$color12"
                        >
                          {children}
                        </Text>
                      </YStack>
                    ),
                    h3: ({ children }) => (
                      <YStack mb="$1">
                        <Text 
                          fontSize="$4" 
                          fontWeight="600"
                          color="$color12"
                        >
                          {children}
                        </Text>
                      </YStack>
                    ),
                    ul: ({ children }) => (
                      <YStack gap="$1" mb="$2">
                        {children}
                      </YStack>
                    ),
                    li: ({ children }) => (
                      <Text 
                        fontSize="$3" 
                        color="$color10" 
                        lineHeight="$1"
                      >
                        • {children}
                      </Text>
                    ),
                    strong: ({ children }) => (
                      <Text 
                        fontWeight="bold"
                        color="$color12"
                      >
                        {children}
                      </Text>
                    ),
                    a: ({ children, href }) => (
                      <Text 
                        color="$accent8"
                        textDecorationLine="underline"
                        onPress={() => {
                          if (href && typeof window !== 'undefined') {
                            window.open(href, '_blank')
                          }
                        }}
                      >
                        {children}
                      </Text>
                    )
                  }}
                >
                  {currentData.highlights || '暂无详细内容'}
                </ReactMarkdown>
              </YStack>
            </Sheet.ScrollView>

            <Button
              size="$4"
              bg="$color5"
              mb="$4"
              onPress={() => setSheetOpen(false)}
            >
              关闭
            </Button>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </Card>
  )
}
