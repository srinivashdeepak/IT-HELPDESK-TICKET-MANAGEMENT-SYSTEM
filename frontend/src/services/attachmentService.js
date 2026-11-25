import api from './api';

export const attachmentService = {
  uploadAttachment: async (ticketId, file, commentId = null) => {
    const formData = new FormData();
    formData.append('ticketId', ticketId);
    if (commentId) formData.append('commentId', commentId);
    formData.append('file', file);

    const res = await api.post('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getTicketAttachments: async (ticketId) => {
    const res = await api.get(`/attachments/ticket/${ticketId}`);
    return res.data;
  },

  downloadFile: async (attachmentId, fileName) => {
    const response = await api.get(`/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'attachment');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default attachmentService;
