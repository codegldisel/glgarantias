import { render, screen } from '@testing-library/react';
import MetricCard from '../MetricCard';

describe('MetricCard', () => {
  it('renderiza o título e valor corretamente', () => {
    render(<MetricCard title="Total de OS" value={42} icon={() => null} description="Descrição" />);
    expect(screen.getByLabelText('Total de OS')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Descrição')).toBeInTheDocument();
  });

  it('exibe placeholder quando hasError', () => {
    render(<MetricCard title="Total de OS" value={42} icon={() => null} description="Descrição" hasError />);
    expect(screen.getByText('---')).toBeInTheDocument();
    expect(screen.getByText('Dados indisponíveis')).toBeInTheDocument();
  });
}); 