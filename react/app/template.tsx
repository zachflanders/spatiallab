import Header from '../components/Header';
import './template.css';
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="template-container">
      <Header className="header" />
      <div className="content">{children}</div>
    </div>
  );
}
