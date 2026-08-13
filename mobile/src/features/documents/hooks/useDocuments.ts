import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsService, Document, UploadDocumentPayload } from '../services/documents.service';

export const DOCUMENTS_KEY = ['documents'];
const documentKey = (id: string) => ['documents', id];

export function useDocuments(params?: { category?: string; search?: string; deleted?: boolean }) {
  return useQuery({
    queryKey: [...DOCUMENTS_KEY, params],
    queryFn: () => documentsService.getAll(params),
  });
}

export function useDocumentDetail(id: string) {
  return useQuery({
    queryKey: documentKey(id),
    queryFn: () => documentsService.getOne(id),
    enabled: !!id,
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadDocumentPayload) => documentsService.upload(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof documentsService.update>[1] }) =>
      documentsService.update(id, data),
    onSuccess: (doc: Document) => {
      qc.setQueryData(documentKey(doc.id), doc);
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: documentsService.softDelete,
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
  });
}

export function useRestoreDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: documentsService.restore,
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
  });
}

export function useDocumentDownloadUrl(id: string) {
  return useQuery({
    queryKey: ['document-url', id],
    queryFn: () => documentsService.getDownloadUrl(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 min (URL valid for 15 min)
  });
}
