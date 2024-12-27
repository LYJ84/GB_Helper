import { render, screen, fireEvent } from '@testing-library/react';
import OrderManagement from '../pages/OrderManagement';

describe('OrderManagement', () => {
  test('renders order list', async () => {
    render(<OrderManagement />);
    expect(await screen.findByText('订单管理')).toBeInTheDocument();
  });

  test('can create new order', async () => {
    render(<OrderManagement />);
    fireEvent.click(screen.getByText('新增订单'));
    expect(screen.getByText('创建订单')).toBeInTheDocument();
  });
}); 