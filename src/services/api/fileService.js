import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export const fileService = {
  // Get all files for a specific task
  async getAllByTask(taskId) {
    try {
      if (!taskId) {
        console.error('Task ID is required for fetching files');
        return [];
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "file_name_c"}},
          {"field": {"Name": "file_size_c"}},
          {"field": {"Name": "file_type_c"}},
          {"field": {"Name": "upload_date_c"}},
          {"field": {"Name": "task_c"}},
          {"field": {"Name": "file_data_c"}},
          {"field": {"Name": "image_data_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        where: [{
          "FieldName": "task_c",
          "Operator": "EqualTo",
          "Values": [parseInt(taskId)],
          "Include": true
        }],
        orderBy: [{
          "fieldName": "CreatedOn",
          "sorttype": "DESC"
        }]
      };

      const response = await apperClient.fetchRecords('file_c', params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching files by task:", error?.response?.data?.message || error);
      return [];
    }
  },

// Get all files
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "file_name_c"}},
          {"field": {"Name": "file_size_c"}},
          {"field": {"Name": "file_type_c"}},
          {"field": {"Name": "upload_date_c"}},
          {"field": {"Name": "task_c"}},
          {"field": {"Name": "file_data_c"}},
          {"field": {"Name": "image_data_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{
          "fieldName": "CreatedOn",
          "sorttype": "DESC"
        }]
      };

      const response = await apperClient.fetchRecords('file_c', params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching files:", error?.response?.data?.message || error);
      return [];
    }
  },

  // Get file by ID
async getById(fileId) {
    try {
      if (!fileId) {
        console.error('File ID is required');
        return null;
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "file_name_c"}},
          {"field": {"Name": "file_size_c"}},
          {"field": {"Name": "file_type_c"}},
          {"field": {"Name": "upload_date_c"}},
          {"field": {"Name": "task_c"}},
          {"field": {"Name": "file_data_c"}},
          {"field": {"Name": "image_data_c"}},
          {"field": {"Name": "CreatedOn"}}
        ]
      };

      const response = await apperClient.getRecordById('file_c', parseInt(fileId), params);

      return response?.data || null;
    } catch (error) {
      console.error(`Error fetching file ${fileId}:`, error?.response?.data?.message || error);
      return null;
    }
  },

// Create file records for a task
  async create(fileData, taskId, fieldType = 'file_data_c') {
    try {
      if (!taskId) {
        throw new Error("Task ID is required for file creation");
      }

      if (!fileData || !fileData.length) {
        return []; // No files to create
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Convert files to API format
      const convertedFiles = window.ApperSDK?.ApperFileUploader?.toCreateFormat(fileData);
      if (!convertedFiles) {
        throw new Error("Failed to convert files to API format");
      }

      const records = fileData.map((file, index) => {
        const record = {
          Name: file.Name || file.name || `File ${index + 1}`,
          file_name_c: file.Name || file.name || `File ${index + 1}`,
          file_size_c: file.Size || file.size || 0,
          file_type_c: file.Type || file.type || 'unknown',
          upload_date_c: new Date().toISOString(),
          task_c: parseInt(taskId)
        };

        // Set the appropriate field based on type
        if (fieldType === 'image_data_c') {
          record.image_data_c = convertedFiles[index] || convertedFiles;
        } else {
          record.file_data_c = convertedFiles[index] || convertedFiles;
        }

        return record;
      });

      const params = { records };

      const response = await apperClient.createRecord('file_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} file records:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => {
                toast.error(`File upload error: ${error.message || error}`);
              });
            }
            if (record.message) {
              toast.error(record.message);
            }
          });
        }

        if (successful.length > 0) {
          const fileType = fieldType === 'image_data_c' ? 'image' : 'file';
          toast.success(`${successful.length} ${fileType}(s) uploaded successfully`);
        }

        return successful.map(r => r.data);
      }

      return [];
    } catch (error) {
      console.error("Error creating file records:", error?.response?.data?.message || error);
      toast.error("Failed to upload files");
      return [];
    }
  },

  // Update file
  async update(fileId, updates) {
    try {
      if (!fileId) {
        throw new Error("File ID is required for update");
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Filter out empty values and only include updateable fields
      const filteredUpdates = { Id: parseInt(fileId) };

      if (updates.Name !== undefined && updates.Name !== null && updates.Name !== "") {
        filteredUpdates.Name = updates.Name;
      }
      if (updates.file_name_c !== undefined && updates.file_name_c !== null && updates.file_name_c !== "") {
        filteredUpdates.file_name_c = updates.file_name_c;
      }

      const params = {
        records: [filteredUpdates]
      };

      const response = await apperClient.updateRecord('file_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update file ${fileId}:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => {
                toast.error(`Update error: ${error.message || error}`);
              });
            }
            if (record.message) {
              toast.error(record.message);
            }
          });
          return null;
        }

        if (successful.length > 0) {
          toast.success('File updated successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error(`Error updating file ${fileId}:`, error?.response?.data?.message || error);
      toast.error("Failed to update file");
      return null;
    }
  },

  // Delete file
  async delete(fileId) {
    try {
      if (!fileId) {
        throw new Error("File ID is required for deletion");
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: [parseInt(fileId)]
      };

      const response = await apperClient.deleteRecord('file_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete file ${fileId}:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) {
              toast.error(record.message);
            }
          });
          return false;
        }

        if (successful.length > 0) {
          toast.success('File deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error(`Error deleting file ${fileId}:`, error?.response?.data?.message || error);
      toast.error("Failed to delete file");
      return false;
    }
  }
};