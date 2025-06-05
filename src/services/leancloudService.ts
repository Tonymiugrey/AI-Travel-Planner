import { AV } from '../config/leancloud'
import { TravelCardData, travelCardsData } from '../data/travelData'

export class LeanCloudService {
  private static readonly CLASS_NAME = 'TravelCard'

  /**
   * 创建 TravelCard 类并上传所有数据
   */
  static async createClassAndUploadData(): Promise<void> {
    try {
      console.log('开始创建 TravelCard 类并上传数据...')
      
      const results: AV.Object[] = []
      
      // 批量保存所有卡片数据
      for (const cardData of travelCardsData) {
        const TravelCard = AV.Object.extend(this.CLASS_NAME)
        const travelCard = new TravelCard()
        
        // 设置所有字段
        Object.keys(cardData).forEach(key => {
          travelCard.set(key, (cardData as any)[key])
        })
        
        results.push(travelCard)
      }
      
      // 批量保存
      await AV.Object.saveAll(results)
      
      console.log(`成功上传 ${results.length} 条数据到 LeanCloud`)
    } catch (error) {
      console.error('上传数据到 LeanCloud 失败:', error)
      throw error
    }
  }

  /**
   * 删除所有记录并重新导入数据
   */
  static async deleteAllAndReimport(): Promise<void> {
    try {
      console.log('开始删除所有记录...')
      
      // 查询所有记录
      const query = new AV.Query(this.CLASS_NAME)
      query.limit(1000) // 设置查询限制
      const allCards = await query.find()
      
      if (allCards.length > 0) {
        // 批量删除
        await AV.Object.destroyAll(allCards as AV.Object[])
        console.log(`成功删除 ${allCards.length} 条记录`)
      } else {
        console.log('没有找到需要删除的记录')
      }
      
      // 重新导入数据
      console.log('开始重新导入数据...')
      await this.createClassAndUploadData()
      
      console.log('删除并重新导入完成!')
    } catch (error) {
      console.error('删除并重新导入失败:', error)
      throw error
    }
  }

  /**
   * 获取所有卡片数据
   */
  static async getAllCards(): Promise<TravelCardData[]> {
    try {
      const query = new AV.Query(this.CLASS_NAME)
      query.limit(1000)
      const results = await query.find()
      
      return results.map(card => {
        const data = card.toJSON()
        // 移除 LeanCloud 的元数据字段
        delete data.objectId
        delete data.createdAt
        delete data.updatedAt
        return data as TravelCardData
      })
    } catch (error) {
      console.error('获取卡片数据失败:', error)
      throw error
    }
  }

  /**
   * 更新卡片
   */
  static async updateCard(updatedCard: TravelCardData): Promise<void> {
    try {
      const query = new AV.Query(this.CLASS_NAME)
      query.equalTo('id', updatedCard.id)
      const card = await query.first()
      
      if (!card) {
        throw new Error(`未找到 ID 为 ${updatedCard.id} 的卡片`)
      }

      // 更新所有字段
      Object.keys(updatedCard).forEach(key => {
        if (key !== 'objectId' && key !== 'createdAt' && key !== 'updatedAt') {
          card.set(key, (updatedCard as any)[key])
        }
      })

      await card.save()
      console.log(`成功更新卡片: ${updatedCard.id}`)
    } catch (error) {
      console.error('更新卡片失败:', error)
      throw error
    }
  }

  /**
   * 删除指定卡片
   */
  static async deleteCard(cardId: string, planBToPromote?: TravelCardData): Promise<void> {
    try {
      const query = new AV.Query(this.CLASS_NAME)
      query.equalTo('id', cardId)
      const card = await query.first()
      
      if (!card) {
        throw new Error(`未找到 ID 为 ${cardId} 的卡片`)
      }

      await card.destroy()
      console.log(`成功删除卡片: ${cardId}`)

      // 如果有planB需要提升为planA，更新它
      if (planBToPromote) {
        const promotedCard: TravelCardData = {
          ...planBToPromote,
          isPlanB: false,
          planAId: undefined
        }
        await this.updateCard(promotedCard)
        console.log(`成功将planB (${planBToPromote.id}) 提升为planA`)
      }
    } catch (error) {
      console.error('删除卡片失败:', error)
      throw error
    }
  }

  /**
   * 创建新卡片
   */
  static async createCard(newCard: TravelCardData): Promise<void> {
    try {
      const CardClass = AV.Object.extend(this.CLASS_NAME)
      const card = new CardClass()
      
      // 设置所有字段
      Object.keys(newCard).forEach(key => {
        card.set(key, newCard[key as keyof TravelCardData])
      })
      
      await card.save()
      console.log(`成功创建卡片: ${newCard.id}`)
    } catch (error) {
      console.error('创建卡片失败:', error)
      throw error
    }
  }

  /**
   * 检查连接状态
   */
  static async testConnection(): Promise<boolean> {
    try {
      const TestObject = AV.Object.extend('TestConnection')
      const testObject = new TestObject()
      testObject.set('test', 'connection')
      await testObject.save()
      await testObject.destroy()
      return true
    } catch (error) {
      console.error('LeanCloud 连接测试失败:', error)
      return false
    }
  }
}
