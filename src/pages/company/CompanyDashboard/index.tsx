import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';

const CompanyDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/users?company=${id}`, {
          params: {
          
            limit: 1,
            fields: 'name'
          }
        });

        const companies =
          response.data.data?.meta.total || response.data.data || [];
        setTotalUsers(companies);
      } catch (error) {
        console.error('Failed to fetch company data:', error);
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className=" p-5 ">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {/* Total Company Card */}
        <div
          onClick={() => navigate('company')}
          className="transform cursor-pointer rounded-xl bg-gradient-to-br from-taskplanner to-tpsecondary p-4 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-white/20 p-4">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">
                Total User
              </h3>
              <p className="mt-1 text-3xl font-bold">
                {loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  totalUsers
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboardPage;
