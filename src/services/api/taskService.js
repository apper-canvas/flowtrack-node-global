import { getApperClient } from '@/services/apperClient'

export const taskService = {
  async getAll() {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{
          "fieldName": "CreatedOn",
          "sorttype": "DESC"
        }]
      }

      const response = await apperClient.fetchRecords('task_c', params)
      
      if (!response.success) {
        console.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error)
      return []
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "completed_at_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      }

      const response = await apperClient.getRecordById('task_c', parseInt(id), params)
      
      if (!response.success) {
        throw new Error(response.message)
      }

      return response.data
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error)
      throw error
    }
  },

  async create(taskData) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const params = {
        records: [{
          title_c: taskData.title_c,
          description_c: taskData.description_c || "",
          priority_c: taskData.priority_c || "medium",
          status_c: taskData.status_c || "active",
          completed_at_c: taskData.completed_at_c || null
        }]
      }

      const response = await apperClient.createRecord('task_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed)
          failed.forEach(record => {
            if (record.message) throw new Error(record.message)
          })
        }
        return successful[0]?.data || {}
      }

      return {}
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error)
      throw error
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      // Filter out undefined/null values and only include updateable fields
      const filteredUpdates = {}
      if (updates.title_c !== undefined && updates.title_c !== null) {
        filteredUpdates.title_c = updates.title_c
      }
      if (updates.description_c !== undefined && updates.description_c !== null) {
        filteredUpdates.description_c = updates.description_c
      }
      if (updates.priority_c !== undefined && updates.priority_c !== null) {
        filteredUpdates.priority_c = updates.priority_c
      }
      if (updates.status_c !== undefined && updates.status_c !== null) {
        filteredUpdates.status_c = updates.status_c
      }
      if (updates.completed_at_c !== undefined && updates.completed_at_c !== null) {
        filteredUpdates.completed_at_c = updates.completed_at_c
      }

      const params = {
        records: [{
          Id: parseInt(id),
          ...filteredUpdates
        }]
      }

      const response = await apperClient.updateRecord('task_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed)
          failed.forEach(record => {
            if (record.message) throw new Error(record.message)
          })
        }
        return successful[0]?.data || {}
      }

      return {}
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error)
      throw error
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient()
      if (!apperClient) {
        throw new Error("ApperClient not initialized")
      }

      const params = {
        RecordIds: [parseInt(id)]
      }

      const response = await apperClient.deleteRecord('task_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, failed)
          failed.forEach(record => {
            if (record.message) throw new Error(record.message)
          })
        }
        return successful.length > 0
      }

      return true
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error)
      throw error
    }
  }
}