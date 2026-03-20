import React from 'react';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterCompany: string;
  onFilterCompany: (c: string) => void;
  filterIndustry: string;
  onFilterIndustry: (i: string) => void;
  companies: string[];
  industries: string[];
}

export const SearchFilter: React.FC<Props> = ({
  searchQuery, onSearchChange,
  filterCompany, onFilterCompany,
  filterIndustry, onFilterIndustry,
  companies, industries,
}) => {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <input
        type="text"
        placeholder="Search connections..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 flex-1 min-w-40"
      />
      <select
        value={filterCompany}
        onChange={(e) => onFilterCompany(e.target.value)}
        className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
      >
        <option value="">All Companies</option>
        {companies.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select
        value={filterIndustry}
        onChange={(e) => onFilterIndustry(e.target.value)}
        className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
      >
        <option value="">All Industries</option>
        {industries.map(i => <option key={i} value={i}>{i}</option>)}
      </select>
    </div>
  );
};
