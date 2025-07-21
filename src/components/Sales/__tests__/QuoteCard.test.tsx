import { render, screen, fireEvent } from '@testing-library/react'
import { QuoteCard } from '../QuoteCard'

// Mock the dependencies
jest.mock('../../ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  )
}))

jest.mock('../../ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>
}))

jest.mock('lucide-react', () => ({
  Eye: () => <span data-testid="eye-icon">👁</span>,
  Edit: () => <span data-testid="edit-icon">✏️</span>,
  Mail: () => <span data-testid="mail-icon">✉️</span>,
  FileText: () => <span data-testid="file-icon">📄</span>,
  ArrowRight: () => <span data-testid="arrow-icon">→</span>
}))

const mockQuote = {
  id: 1,
  title: 'Test Quote',
  customer_name: 'Test Customer',
  status: 'draft' as const,
  total_amount: 1500.00,
  created_at: '2024-01-15T10:00:00Z',
  rep_name: 'John Doe'
}

describe('QuoteCard Component', () => {
  const mockProps = {
    quote: mockQuote,
    onView: jest.fn(),
    onEdit: jest.fn(),
    onEmail: jest.fn(),
    onGeneratePDF: jest.fn(),
    onConvertToOrder: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders quote information correctly', () => {
    render(<QuoteCard {...mockProps} />)
    
    expect(screen.getByText('Test Quote')).toBeInTheDocument()
    expect(screen.getByText('Test Customer')).toBeInTheDocument()
    expect(screen.getByText('$1,500.00')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('displays quote status with correct styling', () => {
    render(<QuoteCard {...mockProps} />)
    
    const statusElement = screen.getByText('draft')
    expect(statusElement).toBeInTheDocument()
    // Note: Actual styling classes would need to be tested based on implementation
  })

  it('formats date correctly', () => {
    render(<QuoteCard {...mockProps} />)
    
    // Assuming date is formatted as MM/dd/yyyy
    expect(screen.getByText(/01\/15\/2024/)).toBeInTheDocument()
  })

  it('calls onView when view button is clicked', () => {
    render(<QuoteCard {...mockProps} />)
    
    const viewButton = screen.getByTestId('eye-icon').closest('button')
    fireEvent.click(viewButton!)
    
    expect(mockProps.onView).toHaveBeenCalledWith(mockQuote)
  })

  it('calls onEdit when edit button is clicked', () => {
    render(<QuoteCard {...mockProps} />)
    
    const editButton = screen.getByTestId('edit-icon').closest('button')
    fireEvent.click(editButton!)
    
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockQuote)
  })

  it('calls onEmail when email button is clicked', () => {
    render(<QuoteCard {...mockProps} />)
    
    const emailButton = screen.getByTestId('mail-icon').closest('button')
    fireEvent.click(emailButton!)
    
    expect(mockProps.onEmail).toHaveBeenCalledWith(mockQuote)
  })

  it('calls onGeneratePDF when PDF button is clicked', () => {
    render(<QuoteCard {...mockProps} />)
    
    const pdfButton = screen.getByTestId('file-icon').closest('button')
    fireEvent.click(pdfButton!)
    
    expect(mockProps.onGeneratePDF).toHaveBeenCalledWith(mockQuote)
  })

  it('calls onConvertToOrder when convert button is clicked', () => {
    render(<QuoteCard {...mockProps} />)
    
    const convertButton = screen.getByTestId('arrow-icon').closest('button')
    fireEvent.click(convertButton!)
    
    expect(mockProps.onConvertToOrder).toHaveBeenCalledWith(mockQuote)
  })

  it('handles different quote statuses', () => {
    const sentQuote = { ...mockQuote, status: 'sent' as const }
    render(<QuoteCard {...mockProps} quote={sentQuote} />)
    
    expect(screen.getByText('sent')).toBeInTheDocument()
  })

  it('handles large amounts correctly', () => {
    const expensiveQuote = { ...mockQuote, total_amount: 999999.99 }
    render(<QuoteCard {...mockProps} quote={expensiveQuote} />)
    
    expect(screen.getByText('$999,999.99')).toBeInTheDocument()
  })

  it('handles missing optional fields gracefully', () => {
    const minimalQuote = {
      ...mockQuote,
      rep_name: null
    }
    render(<QuoteCard {...mockProps} quote={minimalQuote} />)
    
    // Should still render without crashing
    expect(screen.getByText('Test Quote')).toBeInTheDocument()
  })
})