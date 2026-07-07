import { useEffect } from 'react';
import { pageTitle, setMetaDescription } from '../../core/theme';

export function usePageTitle(title?: string, description?: string) {
  useEffect(() => {
    pageTitle(title);
    if (description !== undefined) setMetaDescription(description);
  }, [title, description]);
}
