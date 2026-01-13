import React, { useEffect, useState } from 'react';
import { X, Trophy, Download } from 'lucide-react';
import { getDownloadStats, getTotalDownloads } from '../utils/analytics';

const StatsModal = ({ onClose }) => {
    const [stats, setStats] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, totalData] = await Promise.all([
                    getDownloadStats(),
                    getTotalDownloads()
                ]);
                setStats(statsData || []);
                setTotal(totalData || 0);
            } catch (error) {
                console.error("Failed to load stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-paper-white/95 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-white shadow-2xl border border-gray-100 p-8 md:p-12 flex flex-col max-h-[85vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} className="text-gray-500" />
                </button>

                <div className="mb-8 border-b border-gray-100 pb-4">
                    <h2 className="font-serif italic text-2xl text-paper-black mb-1">Analytics</h2>
                    <p className="font-sans text-[10px] tracking-widest text-gray-400 uppercase">Download Statistics</p>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center min-h-[200px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-paper-black"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8 overflow-hidden">
                        {/* Summary Card */}
                        <div className="flex items-center gap-4 p-6 bg-gray-50 border border-gray-100">
                            <div className="p-3 bg-white rounded-full shadow-sm">
                                <Download size={20} className="text-paper-black" />
                            </div>
                            <div>
                                <span className="block text-3xl font-serif text-paper-black">{total}</span>
                                <span className="text-[10px] font-sans tracking-widest text-gray-400 uppercase">Total Downloads</span>
                            </div>
                        </div>

                        {/* Top Performers List */}
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <h3 className="font-sans text-[10px] tracking-widest text-gray-500 uppercase mb-4 sticky top-0 bg-white py-2">Most Popular</h3>

                            {stats.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No data available yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {stats.map((item, index) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                            <div className="flex items-center gap-4">
                                                <span className={`font-mono text-sm w-6 ${index < 3 ? 'text-paper-black font-bold' : 'text-gray-300'}`}>
                                                    #{index + 1}
                                                </span>
                                                <span className="font-serif text-paper-black text-sm">{item.title || `Image ${item.id}`}</span>
                                                {index === 0 && <Trophy size={14} className="text-yellow-500" />}
                                            </div>
                                            <span className="font-sans text-xs font-medium text-gray-600">{item.downloads}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsModal;
