/**
 * パンくずリストコンポーネント
 */

import { ChevronRight, Home } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="パンくずリスト" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm">
        {/* ホーム */}
        <li>
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="ホーム"
          >
            <Home size={16} />
          </Link>
        </li>

        {/* 各項目 */}
        {items.map((item, index) => (
          <React.Fragment key={`${item.label}-${item.href || index}`}>
            <li className="text-gray-400">
              <ChevronRight size={16} />
            </li>
            <li>
              {item.href ? (
                <Link
                  to={item.href}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-700 font-medium">{item.label}</span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
