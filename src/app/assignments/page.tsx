'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import React from 'react';

interface Assignment {
  id: number;
  assignedDate: string;
  status: string;
  notes?: string;
  employee: {
    id: number;
    name: string;
    department: string;
  };
  device: {
    id: number;
    type: string;
    brand: string;
    model: string;
    serialNumber: string;
  };
}

interface EmployeeWithDevices {
  id: number;
  name: string;
  department: string;
  devices: {
    computer?: {
      brand: string;
      model: string;
      assignedDate: string;
      id: number;
    };
    phone?: {
      brand: string;
      model: string;
      assignedDate: string;
      id: number;
    };
    tablet?: {
      brand: string;
      model: string;
      assignedDate: string;
      id: number;
    };
    other: Array<{
      type: string;
      brand: string;
      model: string;
      assignedDate: string;
      id: number;
    }>;
  };
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [employeesWithDevices, setEmployeesWithDevices] = useState<EmployeeWithDevices[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeWithDevices[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEmployee, setExpandedEmployee] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch('/api/assignments');
        if (!response.ok) {
          throw new Error('Zimmetler getirilemedi');
        }
        const data = await response.json();
        setAssignments(data);
        
        // İlişkili cihazlarıyla birlikte çalışanları grup haline getir
        const employeeMap = new Map<number, EmployeeWithDevices>();
        
        data.forEach((assignment: Assignment) => {
          const employeeId = assignment.employee.id;
          
          if (!employeeMap.has(employeeId)) {
            employeeMap.set(employeeId, {
              id: employeeId,
              name: assignment.employee.name,
              department: assignment.employee.department,
              devices: {
                other: []
              }
            });
          }
          
          const employeeData = employeeMap.get(employeeId)!;
          const deviceType = assignment.device.type.toLowerCase();
          const deviceInfo = {
            brand: assignment.device.brand,
            model: assignment.device.model,
            assignedDate: new Date(assignment.assignedDate).toLocaleDateString('tr-TR'),
            id: assignment.id
          };
          
          if (deviceType.includes('bilgisayar') || deviceType.includes('laptop')) {
            employeeData.devices.computer = deviceInfo;
          } else if (deviceType.includes('telefon')) {
            employeeData.devices.phone = deviceInfo;
          } else if (deviceType.includes('tablet')) {
            employeeData.devices.tablet = deviceInfo;
          } else {
            employeeData.devices.other.push({
              type: assignment.device.type,
              ...deviceInfo
            });
          }
        });
        
        const employeesList = Array.from(employeeMap.values());
        setEmployeesWithDevices(employeesList);
        setFilteredEmployees(employeesList);
      } catch (err) {
        setError('Zimmetler yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Arama ve sıralama işlemi için filter fonksiyonu
  useEffect(() => {
    let filtered = [...employeesWithDevices];

    if (searchTerm.trim() !== '') {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = employeesWithDevices.filter(
        (employee) => {
          // Çalışan adı veya departmanında arama yap
          if (
            employee.name.toLowerCase().includes(lowercasedSearch) ||
            employee.department.toLowerCase().includes(lowercasedSearch)
          ) {
            return true;
          }
          
          // Cihaz bilgilerinde arama yap
          const hasMatchingComputer = employee.devices.computer && 
            (employee.devices.computer.brand.toLowerCase().includes(lowercasedSearch) ||
             employee.devices.computer.model.toLowerCase().includes(lowercasedSearch));
          
          const hasMatchingPhone = employee.devices.phone && 
            (employee.devices.phone.brand.toLowerCase().includes(lowercasedSearch) ||
             employee.devices.phone.model.toLowerCase().includes(lowercasedSearch));
            
          const hasMatchingTablet = employee.devices.tablet && 
            (employee.devices.tablet.brand.toLowerCase().includes(lowercasedSearch) ||
             employee.devices.tablet.model.toLowerCase().includes(lowercasedSearch));
          
          const hasMatchingOther = employee.devices.other.some(device => 
            device.type.toLowerCase().includes(lowercasedSearch) ||
            device.brand.toLowerCase().includes(lowercasedSearch) ||
            device.model.toLowerCase().includes(lowercasedSearch)
          );
          
          return hasMatchingComputer || hasMatchingPhone || hasMatchingTablet || hasMatchingOther;
        }
      );
    }
    
    // İsme göre sırala
    filtered.sort((a, b) => {
      if (sortDirection === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    
    setFilteredEmployees(filtered);
  }, [searchTerm, employeesWithDevices, sortDirection]);

  const toggleExpandEmployee = (employeeId: number) => {
    if (expandedEmployee === employeeId) {
      setExpandedEmployee(null);
    } else {
      setExpandedEmployee(employeeId);
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Zimmetler</h1>
        <p className="mt-1 text-sm text-gray-500">
          Çalışanlara zimmetlenen cihazların listesi
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="w-full sm:w-96">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Çalışan, cihaz markası veya model ara..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <Link
          href="/assignments/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Yeni Zimmet Oluştur
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Çalışan Zimmet Listesi</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              Yükleniyor...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">
              {error}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              {searchTerm ? 'Arama kriterlerine uygun zimmet bulunamadı' : 'Henüz zimmet kaydı bulunmuyor'}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={toggleSortDirection}>
                      Çalışan
                      <span className="ml-2">
                        {sortDirection === 'asc' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bilgisayar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tablet
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <React.Fragment key={employee.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium">
                            {employee.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-xs text-gray-500">{employee.department}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {employee.devices.computer ? (
                          <div>
                            <div className="text-sm text-gray-900">{`${employee.devices.computer.brand} ${employee.devices.computer.model}`}</div>
                            <div className="text-xs text-gray-500">Teslim: {employee.devices.computer.assignedDate}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {employee.devices.phone ? (
                          <div>
                            <div className="text-sm text-gray-900">{`${employee.devices.phone.brand} ${employee.devices.phone.model}`}</div>
                            <div className="text-xs text-gray-500">Teslim: {employee.devices.phone.assignedDate}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {employee.devices.tablet ? (
                          <div>
                            <div className="text-sm text-gray-900">{`${employee.devices.tablet.brand} ${employee.devices.tablet.model}`}</div>
                            <div className="text-xs text-gray-500">Teslim: {employee.devices.tablet.assignedDate}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toggleExpandEmployee(employee.id)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          {expandedEmployee === employee.id ? "Gizle" : "Detay"}
                        </button>
                        <Link
                          href={`/assignments/new?employeeId=${employee.id}`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Zimmet Ekle
                        </Link>
                      </td>
                    </tr>
                    {expandedEmployee === employee.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="space-y-3">
                            <h3 className="font-medium text-gray-900">Zimmet Detayları</h3>
                            
                            {/* Bilgisayar Detayı */}
                            {employee.devices.computer && (
                              <DeviceDetailCard 
                                icon="💻"
                                title="Bilgisayar"
                                brand={employee.devices.computer.brand}
                                model={employee.devices.computer.model}
                                assignedDate={employee.devices.computer.assignedDate}
                                assignmentId={employee.devices.computer.id}
                              />
                            )}
                            
                            {/* Telefon Detayı */}
                            {employee.devices.phone && (
                              <DeviceDetailCard 
                                icon="📱"
                                title="Telefon"
                                brand={employee.devices.phone.brand}
                                model={employee.devices.phone.model}
                                assignedDate={employee.devices.phone.assignedDate}
                                assignmentId={employee.devices.phone.id}
                              />
                            )}
                            
                            {/* Tablet Detayı */}
                            {employee.devices.tablet && (
                              <DeviceDetailCard 
                                icon="📱"
                                title="Tablet"
                                brand={employee.devices.tablet.brand}
                                model={employee.devices.tablet.model}
                                assignedDate={employee.devices.tablet.assignedDate}
                                assignmentId={employee.devices.tablet.id}
                              />
                            )}
                            
                            {/* Diğer Cihazlar */}
                            {employee.devices.other.map(device => (
                              <DeviceDetailCard 
                                key={device.id}
                                icon="📦"
                                title={device.type}
                                brand={device.brand}
                                model={device.model}
                                assignedDate={device.assignedDate}
                                assignmentId={device.id}
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function DeviceDetailCard({ 
  icon, 
  title, 
  brand, 
  model, 
  assignedDate, 
  assignmentId 
}: { 
  icon: string;
  title: string;
  brand: string;
  model: string;
  assignedDate: string;
  assignmentId: number;
}) {
  return (
    <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className="text-2xl mr-3">{icon}</div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{title}: {brand} {model}</h4>
          <p className="text-sm text-gray-500">Teslim Tarihi: {assignedDate}</p>
        </div>
        <div>
          <Link
            href={`/assignments/${assignmentId}`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Zimmet Detayı
          </Link>
        </div>
      </div>
    </div>
  );
} 