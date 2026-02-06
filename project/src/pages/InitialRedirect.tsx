import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

const InitialRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToFirstPage = async () => {
      try {
        // 1️⃣ Get all modules
        const modulesRes = await api.get('/api/modules/');
        const modules = modulesRes.data;

        if (!modules.length) {
          toast.error('No modules found');
          return;
        }

        const firstModule = modules.sort(
          (a: any, b: any) => a.order - b.order
        )[0];

        // 2️⃣ Get module details
        const moduleRes = await api.get(`/api/modules/${firstModule.id}/`);
        const firstContent = moduleRes.data.main_contents?.[0];

        const firstPage = firstContent?.pages
          ?.sort((a: any, b: any) => a.order - b.order)[0];

        if (!firstPage) {
          toast.error('No pages found in first module');
          return;
        }

        // 3️⃣ Navigate to PageDetail
        navigate(`/page/${firstPage.id}`, {
          replace: true,
          state: { moduleId: firstModule.id },
        });
      } catch (err) {
        toast.error('Failed to load course');
      }
    };

    redirectToFirstPage();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#203f78' }}
      />
    </div>
  );
};

export default InitialRedirect;
