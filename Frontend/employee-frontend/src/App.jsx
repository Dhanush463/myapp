import { Routes, Route, Link } from 'react-router-dom';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';

function App() {
  return (
    <div className="container">
      <nav className="navbar">
        <h2>Employee Management</h2>
        <Link to="/add" className="btn btn-primary">+ Add Employee</Link>
      </nav>

      <Routes>
        <Route path="/" element={<EmployeeList />} />
        <Route path="/add" element={<EmployeeForm />} />
        <Route path="/edit/:id" element={<EmployeeForm />} />
      </Routes>
    </div>
  );
}

export default App;