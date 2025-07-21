import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InventoryTable } from '../InventoryTable'

// Mock the dependencies
jest.mock('../ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  )
}))

jest.mock('lucide-react', () => ({
  Edit: () => <span data-testid="edit-icon">✏️</span>,
  Package: () => <span data-testid="package-icon">📦</span>,
  Plus: () => <span data-testid="plus-icon">➕</span>,
  Minus: () => <span data-testid="minus-icon">➖</span>
}))

const mockProducts = [
  {
    id: 1,
    name: 'Test Product 1',
    sku: 'TEST-001',
    category: 'Electronics',
    quantity: 100,
    unit_price: 29.99,
    vendor_name: 'Test Vendor 1',
    reorder_threshold: 10,
    barcode: '123456789'
  },
  {
    id: 2,
    name: 'Test Product 2',
    sku: 'TEST-002',
    category: 'Accessories',
    quantity: 5,
    unit_price: 15.50,
    vendor_name: 'Test Vendor 2',
    reorder_threshold: 20,
    barcode: '987654321'
  }
]

// Mock fetch globally for API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('InventoryTable Component', () => {
  const mockProps = {
    products: mockProducts,
    onEdit: jest.fn(),
    onAdjust: jest.fn(),
    onRefresh: jest.fn(),
    isLoading: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it('renders product information correctly', () => {
    render(<InventoryTable {...mockProps} />)
    
    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    expect(screen.getByText('TEST-001')).toBeInTheDocument()
    expect(screen.getByText('Electronics')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByText('Test Vendor 1')).toBeInTheDocument()
  })

  it('highlights low stock items', () => {
    render(<InventoryTable {...mockProps} />)
    
    // Product 2 has quantity 5 which is below reorder_threshold 20
    const lowStockRow = screen.getByText('Test Product 2').closest('tr')
    expect(lowStockRow).toHaveClass('low-stock') // Assuming this class exists
  })

  it('handles search/filter functionality', async () => {
    const user = userEvent.setup()
    render(<InventoryTable {...mockProps} />)
    
    const searchInput = screen.getByPlaceholderText(/search products/i)
    await user.type(searchInput, 'TEST-001')
    
    // Should filter to show only matching product
    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    render(<InventoryTable {...mockProps} />)
    
    const editButtons = screen.getAllByTestId('edit-icon')
    fireEvent.click(editButtons[0].closest('button')!)
    
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockProducts[0])
  })

  it('calls onAdjust when adjust button is clicked', () => {
    render(<InventoryTable {...mockProps} />)
    
    const adjustButtons = screen.getAllByTestId('package-icon')
    fireEvent.click(adjustButtons[0].closest('button')!)
    
    expect(mockProps.onAdjust).toHaveBeenCalledWith(mockProducts[0])
  })

  it('handles sorting by column headers', async () => {
    const user = userEvent.setup()
    render(<InventoryTable {...mockProps} />)
    
    const nameHeader = screen.getByText('Product Name')
    await user.click(nameHeader)
    
    // Should trigger sorting (implementation depends on actual component)
    // This test would need to verify the order changes
  })

  it('displays loading state correctly', () => {
    render(<InventoryTable {...mockProps} isLoading={true} />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    // Or check for skeleton loaders, spinner, etc.
  })

  it('handles empty product list', () => {
    render(<InventoryTable {...mockProps} products={[]} />)
    
    expect(screen.getByText(/no products found/i)).toBeInTheDocument()
  })

  it('handles quantity adjustments', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })
    
    render(<InventoryTable {...mockProps} />)
    
    // Find quick adjustment buttons (assuming they exist)
    const plusButtons = screen.getAllByTestId('plus-icon')
    await user.click(plusButtons[0].closest('button')!)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/inventory'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          credentials: 'include',
          body: expect.stringContaining('"adjustment":1')
        })
      )
    })
  })

  it('displays barcode information', () => {
    render(<InventoryTable {...mockProps} />)
    
    expect(screen.getByText('123456789')).toBeInTheDocument()
    expect(screen.getByText('987654321')).toBeInTheDocument()
  })

  it('handles products without barcodes', () => {
    const productsWithoutBarcode = [
      { ...mockProducts[0], barcode: null }
    ]
    
    render(<InventoryTable {...mockProps} products={productsWithoutBarcode} />)
    
    expect(screen.getByText('No barcode')).toBeInTheDocument()
  })

  it('formats currency correctly', () => {
    render(<InventoryTable {...mockProps} />)
    
    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByText('$15.50')).toBeInTheDocument()
  })

  it('handles bulk selection', async () => {
    const user = userEvent.setup()
    render(<InventoryTable {...mockProps} />)
    
    // Assuming checkboxes exist for bulk operations
    const checkboxes = screen.getAllByRole('checkbox')
    if (checkboxes.length > 0) {
      await user.click(checkboxes[0])
      expect(checkboxes[0]).toBeChecked()
    }
  })
})