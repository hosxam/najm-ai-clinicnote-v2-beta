import { createHashRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { DetailedEncounterPage } from '../pages/DetailedEncounterPage'
import { FeedbackPage } from '../pages/FeedbackPage'
import { HomePage } from '../pages/HomePage'
import { MedicalReportPage } from '../pages/MedicalReportPage'
import { QuickNotePage } from '../pages/QuickNotePage'
import { SafetyPage } from '../pages/SafetyPage'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'quick-note', element: <QuickNotePage /> },
      { path: 'quick-note/:workflowId', element: <QuickNotePage /> },
      { path: 'encounter', element: <DetailedEncounterPage /> },
      { path: 'encounter/:workflowId', element: <DetailedEncounterPage /> },
      { path: 'report', element: <MedicalReportPage /> },
      { path: 'report/:workflowId', element: <MedicalReportPage /> },
      { path: 'feedback', element: <FeedbackPage /> },
      { path: 'safety', element: <SafetyPage /> },
    ],
  },
])
