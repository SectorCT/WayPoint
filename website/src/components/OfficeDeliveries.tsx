import React, { useState, useEffect } from 'react';
import { fetchUndeliveredPackagesRoute, fetchOfficeDeliveries } from '../utils/api';

interface OfficeDelivery {
  office: {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  packages: Array<{
    packageID: string;
    recipient: string;
    recipientPhoneNumber: string;
    weight: number;
    address: string;
    status: string;
    driver?: string; // Driver who left the package
  }>;
}

interface OfficeDeliveriesProps {
  selectedRoute: string | null;
  routes: any[];
  token: string;
}

const OfficeDeliveries: React.FC<OfficeDeliveriesProps> = ({ selectedRoute, routes, token }) => {
  const [officeDeliveries, setOfficeDeliveries] = useState<OfficeDelivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOffice, setExpandedOffice] = useState<number | null>(null);

  useEffect(() => {
    // Fetch all office deliveries regardless of selected route
    fetchAllOfficeDeliveries();
  }, [token, routes]);

  const fetchAllOfficeDeliveries = async () => {
    setLoading(true);
    setError(null);
    try {
      // For now, we'll fetch from all active routes
      // In a real implementation, you might want to fetch all offices with undelivered packages
      const allOfficeData: OfficeDelivery[] = [];
      
      // Get all active routes and their undelivered packages
      for (const route of routes) {
        if (route.user) {
          try {
            const data = await fetchUndeliveredPackagesRoute(token, route.user);
            if (data.undelivered_offices && data.undelivered_offices.length > 0) {
              // Add driver information to packages
              const officesWithDriver = data.undelivered_offices.map((office: any) => ({
                ...office,
                packages: office.packages.map((pkg: any) => ({
                  ...pkg,
                  driver: route.user
                }))
              }));
              allOfficeData.push(...officesWithDriver);
            }
          } catch (err) {
            console.error(`Failed to fetch data for driver ${route.user}:`, err);
          }
        }
      }
      
      // Group by office and merge packages
      const officeMap = new Map();
      allOfficeData.forEach(officeData => {
        const officeId = officeData.office.id;
        if (officeMap.has(officeId)) {
          // Merge packages
          officeMap.get(officeId).packages.push(...officeData.packages);
        } else {
          officeMap.set(officeId, officeData);
        }
      });
      
      setOfficeDeliveries(Array.from(officeMap.values()));
    } catch (err: any) {
      console.error('Failed to fetch office deliveries:', err);
      setError(err.message || 'Failed to fetch office deliveries');
      setOfficeDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const getTotalPackages = () => {
    return officeDeliveries.reduce((total, office) => total + office.packages.length, 0);
  };

  const getTotalWeight = () => {
    const totalWeight = officeDeliveries.reduce((total, office) => 
      total + office.packages.reduce((officeTotal, pkg) => officeTotal + Number(pkg.weight), 0), 0
    );
    return totalWeight.toFixed(2);
  };

  // Always show the office deliveries component

  return (
         <div style={{
       background: '#fff',
       borderRadius: 16,
       boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
       padding: 24,
       height: 'fit-content',
       minHeight: 600,
       width: 320,
       display: 'flex',
       flexDirection: 'column',
     }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #F39358 0%, #F05033 100%)',
          borderRadius: 8,
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          color: '#fff'
        }}>
          🏢
        </div>
        <div>
          <h3 style={{ 
            margin: 0, 
            fontSize: 18, 
            fontWeight: 700, 
            color: '#F05033' 
          }}>
            Office Deliveries
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: 12, 
            color: '#888',
            marginTop: 2
          }}>
            Undelivered packages
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          flex: 1,
          gap: 12
        }}>
          <div style={{ fontSize: 32, opacity: 0.5 }}>⏳</div>
          <p style={{ color: '#888', fontSize: 14 }}>Loading office deliveries...</p>
        </div>
      ) : error ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          flex: 1,
          gap: 12
        }}>
          <div style={{ fontSize: 32, opacity: 0.5 }}>⚠️</div>
          <p style={{ color: '#F05033', fontSize: 14, textAlign: 'center' }}>{error}</p>
        </div>
             ) : officeDeliveries.length === 0 ? (
         <div style={{ 
           display: 'flex', 
           flexDirection: 'column',
           alignItems: 'center', 
           justifyContent: 'center',
           flex: 1,
           gap: 12
         }}>
           <div style={{ fontSize: 32, opacity: 0.5 }}>✅</div>
           <p style={{ color: '#4CAF50', fontSize: 14, textAlign: 'center', fontWeight: 600 }}>
             All packages delivered!
           </p>
           <p style={{ color: '#888', fontSize: 12, textAlign: 'center' }}>
             No undelivered packages to offices
           </p>
         </div>
       ) : (
         <>
           {/* Summary Stats */}
           <div style={{
             display: 'flex',
             gap: 12,
             marginBottom: 20,
             padding: 16,
             background: '#f8f9fa',
             borderRadius: 12,
             border: '1px solid #e9ecef'
           }}>
             <div style={{ flex: 1, textAlign: 'center' }}>
               <div style={{ fontSize: 20, fontWeight: 700, color: '#F05033' }}>
                 {officeDeliveries.length}
               </div>
               <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                 Offices
               </div>
             </div>
             <div style={{ flex: 1, textAlign: 'center' }}>
               <div style={{ fontSize: 20, fontWeight: 700, color: '#F39358' }}>
                 {getTotalPackages()}
               </div>
               <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                 Packages
               </div>
             </div>
             <div style={{ flex: 1, textAlign: 'center' }}>
               <div style={{ fontSize: 20, fontWeight: 700, color: '#4CAF50' }}>
                 {getTotalWeight()}kg
               </div>
               <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                 Total Weight
               </div>
             </div>
           </div>

                       {/* Office List */}
                         <div style={{ 
               display: 'flex', 
               flexDirection: 'column', 
               gap: 12,
               maxHeight: 500,
               overflowY: 'auto',
               paddingRight: 4
             }}>
              {officeDeliveries.map((officeDelivery, index) => (
                <div
                  key={officeDelivery.office.id}
                  style={{
                    border: '1px solid #e9ecef',
                    borderRadius: 12,
                    overflow: 'hidden',
                    background: '#fff',
                    transition: 'all 0.2s ease',
                    minHeight: expandedOffice === officeDelivery.office.id ? 'auto' : 'auto'
                  }}
                >
                  <div
                    style={{
                      padding: 16,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: expandedOffice === officeDelivery.office.id ? '#f8f9fa' : '#fff',
                      transition: 'background 0.2s ease',
                      minHeight: 60
                    }}
                    onClick={() => setExpandedOffice(
                      expandedOffice === officeDelivery.office.id ? null : officeDelivery.office.id
                    )}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: '#333',
                        marginBottom: 4
                      }}>
                        {officeDelivery.office.name}
                      </div>
                      <div style={{ 
                        fontSize: 12, 
                        color: '#666',
                        lineHeight: 1.3
                      }}>
                        {officeDelivery.office.address}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8
                    }}>
                      <div style={{
                        background: '#F39358',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '4px 8px',
                        borderRadius: 6
                      }}>
                        {officeDelivery.packages.length} pkg{officeDelivery.packages.length !== 1 ? 's' : ''}
                      </div>
                      <div style={{ 
                        fontSize: 16, 
                        color: '#888',
                        transform: expandedOffice === officeDelivery.office.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}>
                        ▼
                      </div>
                    </div>
                  </div>

                  {expandedOffice === officeDelivery.office.id && (
                    <div style={{
                      borderTop: '1px solid #e9ecef',
                      background: '#f8f9fa',
                      padding: 16
                    }}>
                      <div style={{ 
                        fontSize: 12, 
                        fontWeight: 600, 
                        color: '#666',
                        marginBottom: 12,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}>
                        Packages to Deliver
                      </div>
                                             <div style={{ 
                         display: 'flex', 
                         flexDirection: 'column', 
                         gap: 8,
                         maxHeight: officeDelivery.packages.length > 1 ? 400 : 'auto',
                         overflowY: officeDelivery.packages.length > 1 ? 'auto' : 'visible',
                         paddingRight: officeDelivery.packages.length > 1 ? 4 : 0
                       }}>
                        {officeDelivery.packages.map((pkg) => (
                          <div
                            key={pkg.packageID}
                                                         style={{
                               background: '#fff',
                               border: '1px solid #e9ecef',
                               borderRadius: 8,
                               padding: 12,
                               display: 'flex',
                               flexDirection: 'column',
                               gap: 4,
                               minHeight: 100
                             }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div style={{ 
                                fontSize: 12, 
                                fontWeight: 600, 
                                color: '#F05033',
                                fontFamily: 'monospace'
                              }}>
                                #{pkg.packageID}
                              </div>
                              <div style={{
                                background: '#4CAF50',
                                color: '#fff',
                                fontSize: 10,
                                fontWeight: 600,
                                padding: '2px 6px',
                                borderRadius: 4
                              }}>
                                {Number(pkg.weight).toFixed(2)}kg
                              </div>
                            </div>
                            <div style={{ 
                              fontSize: 11, 
                              color: '#333',
                              fontWeight: 500
                            }}>
                              {pkg.recipient}
                            </div>
                            <div style={{ 
                              fontSize: 10, 
                              color: '#666',
                              lineHeight: 1.3
                            }}>
                              {pkg.address}
                            </div>
                            <div style={{ 
                              fontSize: 10, 
                              color: '#888'
                            }}>
                              📞 {pkg.recipientPhoneNumber}
                            </div>
                            {pkg.driver && (
                              <div style={{ 
                                fontSize: 10, 
                                color: '#F39358',
                                fontWeight: 600,
                                marginTop: 2
                              }}>
                                🚚 Left by: {pkg.driver}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
         </>
       )}
    </div>
  );
};

export default OfficeDeliveries;
