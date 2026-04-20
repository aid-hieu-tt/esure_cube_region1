/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DashboardContainer } from './components/DashboardContainer';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <div className="font-sans antialiased text-slate-900">
      <ErrorBoundary>
        <DashboardContainer />
      </ErrorBoundary>
    </div>
  );
}
