import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Loader2, Database, CheckCircle, Trash2, AlertTriangle, RefreshCcw, Search } from 'lucide-react';

export const DataGenerator: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWiping, setIsWiping] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError("Supabase 설정이 필요합니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      setRequests(data || []);
    } catch (err: any) {
      console.error("Admin Dashboard Fetch Error:", err);
      setError(err.message || "데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  /* Email Helper */
  const openEmailClient = (to: string, subject: string, body: string) => {
    if (!to) {
      alert("사용자 이메일 정보가 없습니다.");
      return;
    }
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const approve = async (req: any) => {
    const confirmApprove = window.confirm(`${req.user_nickname}님의 입금을 승인하고 ${req.credits} 크레딧을 지급하시겠습니까?`);
    if (!confirmApprove) return;

    try {
      setLoading(true);
      // 1. 현재 프로필 크레딧 조회
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', req.user_id)
        .maybeSingle();

      if (pError) throw pError;

      const currentCredits = profile?.credits || 0;
      const newCredits = currentCredits + req.credits;

      // 2. 크레딧 합산 업데이트
      const { error: uError } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', req.user_id);

      if (uError) throw uError;

      // 3. 결제 요청 상태 변경
      const { error: rError } = await supabase
        .from('payment_requests')
        .update({ status: 'APPROVED' })
        .eq('id', req.id);

      if (rError) throw rError;

      // 4. Open Email Client
      const subject = `[PawTrait Art] 크레딧 충전 완료 안내`;
      const body = `안녕하세요, ${req.user_name || '회원'}님.\n\n요청하신 크레딧 충전이 완료되었습니다.\n충전된 크레딧: ${req.credits} Cr\n\n지금 바로 스튜디오에서 나만의 명작을 만들어보세요!\n감사합니다.`;

      openEmailClient(req.user_email, subject, body);

      await fetchRequests();
    } catch (err: any) {
      console.error("Approval Process Error:", err);
      alert("❌ 승인 처리 중 오류 발생: " + (err.message || "알 수 없는 오류"));
    } finally {
      setLoading(false);
    }
  };

  const reject = async (req: any) => {
    const confirmReject = window.confirm(`${req.user_nickname}님의 입금 요청을 거절(미승인) 처리하시겠습니까?`);
    if (!confirmReject) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('payment_requests')
        .update({ status: 'REJECTED' })
        .eq('id', req.id);

      if (error) throw error;

      // Open Email Client
      const subject = `[PawTrait Art] 크레딧 충전 미승인 안내`;
      const body = `안녕하세요, ${req.user_name || '회원'}님.\n\n요청하신 크레딧 충전 건이 확인되지 않아 미승인 처리되었습니다.\n\n입금자명과 금액을 다시 한번 확인해 주시거나,\n문의 사항이 있으시면 회신 부탁드립니다.\n\n감사합니다.`;

      openEmailClient(req.user_email, subject, body);

      await fetchRequests();
    } catch (err: any) {
      console.error("Rejection Process Error:", err);
      alert("❌ 처리 중 오류 발생: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const wipeTable = async (tableName: string) => {
    const confirm = window.confirm(`⚠️ 경고: [${tableName}]의 모든 데이터를 삭제하시겠습니까? (복구 불가)`);
    if (!confirm) return;

    setIsWiping(true);
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      alert(`✅ ${tableName} 테이블이 초기화되었습니다.`);
      await fetchRequests();
    } catch (err: any) {
      alert(`❌ 삭제 실패: ` + err.message);
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-slate-900 min-h-screen text-white font-mono">
      <div className="max-w-4xl mx-auto space-y-10">

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-800 pb-8 pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-slate-400 text-xs mt-1">Management of payment requests</p>
            </div>
          </div>
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 disabled:opacity-50 active:scale-95"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-bold">새로고침</span>
          </button>
        </header>

        <section className="space-y-4">
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4 bg-slate-800/10 rounded-3xl border border-dashed border-slate-800">
              <Loader2 className="animate-spin w-12 h-12 text-brand-500" />
              <p className="text-slate-500 text-sm font-bold">서버에서 입금 요청 데이터를 가져오는 중...</p>
            </div>
          ) : error ? (
            <div className="p-10 bg-red-900/10 border border-red-900/30 rounded-3xl text-red-400 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
              <p className="font-bold text-lg mb-2">데이터 로드 실패</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-24 text-center bg-slate-800/10 rounded-3xl border border-dashed border-slate-800 flex flex-col items-center gap-4">
              <Search className="w-10 h-10 text-slate-700" />
              <p className="text-slate-500 font-bold">대기 중인 입금 요청이 없습니다.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {requests.map(req => (
                <div key={req.id} className={`p-6 bg-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border transition-all ${req.status === 'PENDING' ? 'border-amber-900/30 ring-1 ring-amber-500/20' : req.status === 'REJECTED' ? 'border-red-900/30 opacity-50' : 'border-slate-700 opacity-50'}`}>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className={`w-3 h-3 rounded-full ${req.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : req.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="font-bold text-xl">{req.user_name || req.user_nickname}님</span>
                      <span className="text-slate-500 text-sm font-medium">({req.package_name})</span>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400 w-16">입금자명</span>
                        <span className="text-white font-bold">{req.user_name || req.user_nickname}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400 w-16">이메일</span>
                        <span className="text-white font-mono text-xs">{req.user_email || '이메일 정보 없음'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400 w-16">요청시각</span>
                        <span className="text-slate-500 text-xs">{new Date(req.created_at).toLocaleString('ko-KR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-1">
                      <div className="bg-slate-900 px-3 py-1.5 rounded-lg text-sm">
                        <span className="text-slate-500 mr-2">입금액</span>
                        <span className="text-brand-400 font-bold">{req.amount.toLocaleString()}원</span>
                      </div>
                      <div className="bg-slate-900 px-3 py-1.5 rounded-lg text-sm">
                        <span className="text-slate-500 mr-2">지급</span>
                        <span className="text-green-400 font-bold">{req.credits} Cr</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto flex flex-col gap-2">
                    {req.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => approve(req)}
                          disabled={loading}
                          className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-xl shadow-brand-900/20 active:scale-95"
                        >
                          승인 및 이메일 발송
                        </button>
                        <button
                          onClick={() => reject(req)}
                          disabled={loading}
                          className="w-full sm:w-auto bg-slate-800 hover:bg-red-900/50 text-red-400 border border-red-900/30 px-8 py-2 rounded-xl font-bold transition-all disabled:opacity-50 active:scale-95 text-sm"
                        >
                          미승인 (거절)
                        </button>
                      </>
                    ) : (
                      <div className={`text-slate-500 font-bold px-8 py-4 border border-slate-700 rounded-xl text-center bg-slate-900/50 ${req.status === 'REJECTED' ? 'text-red-900/50' : ''}`}>
                        {req.status === 'APPROVED' ? '승인 처리 완료' : '미승인 처리됨'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="pt-12 border-t border-red-900/20">
          <h2 className="text-red-500 font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> 데이터 초기화 구역
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => wipeTable('payment_requests')}
              disabled={isWiping}
              className="p-5 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-sm font-bold hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 group"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> 결제 요청 내역 삭제
            </button>
            <button
              onClick={() => wipeTable('reviews')}
              disabled={isWiping}
              className="p-5 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-sm font-bold hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 group"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> 전체 이용 후기 삭제
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};