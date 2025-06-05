import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { TravelCardData } from '../data/travelData'
import { LeanCloudService } from '../services/leancloudService'

interface DataContextType {
  travelCards: TravelCardData[]
  isLoading: boolean
  error: string | null
  refreshData: () => Promise<void>
  useLocalData: boolean
  setUseLocalData: (useLocal: boolean) => void
  updateCard: (updatedCard: TravelCardData) => Promise<void>
  updateCardWithSync: (updatedCard: TravelCardData, syncTimeAndDate?: boolean) => Promise<{ affectedCards: TravelCardData[] }>
  createCard: (newCard: TravelCardData) => Promise<void>
  deleteCard: (cardId: string) => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

interface DataProviderProps {
  children: ReactNode
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [travelCards, setTravelCards] = useState<TravelCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useLocalData, setUseLocalData] = useState(false)

  // 从 localStorage 读取数据源偏好
  useEffect(() => {
    const saved = localStorage.getItem('travel-app-use-local-data')
    if (saved !== null) {
      setUseLocalData(JSON.parse(saved))
    }
  }, [])

  // 保存数据源偏好到 localStorage
  useEffect(() => {
    localStorage.setItem('travel-app-use-local-data', JSON.stringify(useLocalData))
  }, [useLocalData])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (useLocalData) {
        // 使用本地数据
        const { travelCardsData } = await import('../data/travelData')
        setTravelCards(travelCardsData)
      } else {
        // 使用 LeanCloud 数据
        const cards = await LeanCloudService.getAllCards()
        setTravelCards(cards)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : '加载数据失败')
      
      // 如果 LeanCloud 加载失败，回退到本地数据
      if (!useLocalData) {
        try {
          const { travelCardsData } = await import('../data/travelData')
          setTravelCards(travelCardsData)
          setError('LeanCloud 加载失败，已切换到本地数据')
        } catch (localErr) {
          console.error('Error loading local data:', localErr)
          setError('本地数据也加载失败')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    await loadData()
  }

  // 更新卡片
  const updateCard = async (updatedCard: TravelCardData) => {
    try {
      if (!useLocalData) {
        // 在 LeanCloud 中更新
        await LeanCloudService.updateCard(updatedCard)
      }
      
      // 更新本地状态
      setTravelCards(prevCards => 
        prevCards.map(card => 
          card.id === updatedCard.id 
            ? { ...updatedCard }
            : card
        )
      )
    } catch (err) {
      console.error('Error updating card:', err)
      setError(err instanceof Error ? err.message : '更新卡片失败')
      throw err
    }
  }

  // 从时间字符串中提取开始时间
  const extractStartTime = (timeStr: string): string => {
    if (!timeStr) return ''
    return timeStr.includes('-') ? timeStr.split('-')[0].trim() : timeStr.trim()
  }

  // 从时间字符串中提取结束时间
  const extractEndTime = (timeStr: string): string => {
    if (!timeStr || !timeStr.includes('-')) return ''
    return timeStr.split('-')[1].trim()
  }

  // 构建新的时间字符串，只替换开始时间
  const buildTimeWithNewStart = (originalTime: string, newStartTime: string): string => {
    const originalEndTime = extractEndTime(originalTime)
    if (originalEndTime) {
      return `${newStartTime}-${originalEndTime}`
    }
    return newStartTime
  }

  // 更新卡片并同步相关卡片
  const updateCardWithSync = async (updatedCard: TravelCardData, syncTimeAndDate: boolean = false): Promise<{ affectedCards: TravelCardData[] }> => {
    try {
      const affectedCards: TravelCardData[] = [updatedCard]
      
      if (syncTimeAndDate) {
        // 查找需要同步的相关卡片
        let relatedCard: TravelCardData | undefined
        
        if (updatedCard.isPlanB) {
          // 如果是planB，找到对应的planA
          relatedCard = travelCards.find(card => 
            card.id === updatedCard.planAId && !card.isPlanB
          )
        } else {
          // 如果是planA，找到对应的planB
          relatedCard = travelCards.find(card => 
            card.isPlanB && card.planAId === updatedCard.id
          )
        }
        
        if (relatedCard) {
          // 提取更新卡片的开始时间
          const newStartTime = extractStartTime(updatedCard.time)
          
          // 创建同步后的相关卡片 - 只同步日期和开始时间，保留原有的结束时间
          const syncedRelatedCard: TravelCardData = {
            ...relatedCard,
            day: updatedCard.day,
            time: buildTimeWithNewStart(relatedCard.time, newStartTime)
          }
          affectedCards.push(syncedRelatedCard)
          
          if (!useLocalData) {
            // 在 LeanCloud 中更新两张卡片
            await LeanCloudService.updateCard(updatedCard)
            await LeanCloudService.updateCard(syncedRelatedCard)
          }
          
          // 更新本地状态 - 同时更新两张卡片
          setTravelCards(prevCards => 
            prevCards.map(card => {
              if (card.id === updatedCard.id) {
                return updatedCard
              } else if (card.id === relatedCard!.id) {
                return syncedRelatedCard
              }
              return card
            })
          )
        } else {
          // 没有相关卡片，只更新当前卡片
          if (!useLocalData) {
            await LeanCloudService.updateCard(updatedCard)
          }
          
          setTravelCards(prevCards => 
            prevCards.map(card => 
              card.id === updatedCard.id ? updatedCard : card
            )
          )
        }
      } else {
        // 不需要同步，直接更新当前卡片
        await updateCard(updatedCard)
      }
      
      return { affectedCards }
    } catch (err) {
      console.error('Error updating card with sync:', err)
      setError(err instanceof Error ? err.message : '更新卡片失败')
      throw err
    }
  }

  // 删除卡片
  const deleteCard = async (cardId: string) => {
    try {
      // 查找要删除的卡片
      const cardToDelete = travelCards.find(card => card.id === cardId)
      if (!cardToDelete) {
        throw new Error(`未找到 ID 为 ${cardId} 的卡片`)
      }

      // 如果删除的是planA且有对应的planB，需要将planB转换为新的planA
      let planBToPromote: TravelCardData | undefined
      if (!cardToDelete.isPlanB) {
        // 查找与此planA关联的planB
        planBToPromote = travelCards.find(card => 
          card.isPlanB && card.planAId === cardId
        )
      }

      if (!useLocalData) {
        // 在 LeanCloud 中删除和更新
        await LeanCloudService.deleteCard(cardId, planBToPromote)
      }
      
      // 更新本地状态
      setTravelCards(prevCards => {
        let updatedCards = prevCards.filter(card => card.id !== cardId)
        
        // 如果有planB需要提升为planA
        if (planBToPromote) {
          updatedCards = updatedCards.map(card => {
            if (card.id === planBToPromote!.id) {
              return {
                ...card,
                isPlanB: false,
                planAId: undefined
              }
            }
            return card
          })
        }
        
        return updatedCards
      })
    } catch (err) {
      console.error('Error deleting card:', err)
      setError(err instanceof Error ? err.message : '删除卡片失败')
      throw err
    }
  }

  // 创建新卡片
  const createCard = async (newCard: TravelCardData) => {
    try {
      if (!useLocalData) {
        // 在 LeanCloud 中创建
        await LeanCloudService.createCard(newCard)
      }
      
      // 更新本地状态
      setTravelCards(prevCards => [...prevCards, newCard])
    } catch (err) {
      console.error('Error creating card:', err)
      setError(err instanceof Error ? err.message : '创建卡片失败')
      throw err
    }
  }

  // 初始化时加载数据
  useEffect(() => {
    loadData()
  }, [useLocalData])

  const value: DataContextType = {
    travelCards,
    isLoading,
    error,
    refreshData,
    useLocalData,
    setUseLocalData,
    updateCard,
    updateCardWithSync,
    deleteCard,
    createCard
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = (): DataContextType => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
