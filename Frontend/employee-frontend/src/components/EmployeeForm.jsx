import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import employeeService from '../services/employeeService';

const emptyForm = { name: '', email: '', department: '', salary: '' };

function EmployeeForm() {
  const { id } = useParams();          // present only in edit mode
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    employeeService
      .getById(id)
      .then((res) => {
        const { name, email, department, salary } = res.data;
        setForm({ name, email, department: department ?? '', salary: salary ?? '' });
      })
      .catch(() => setErrors({ general: 'Employee not found.' }));
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const payload = {
      ...form,
      salary: form.salary === '' ? null : Number(form.salary),
    };

    try {
      if (isEdit) {
        await employeeService.update(id, payload);
      } else {
        await employeeService.create(payload);
      }
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      if (data?.error) {
        setErrors({ general: data.error });      // e.g. "Email already exists"
      } else if (data && typeof data === 'object') {
        setErrors(data);                          // field-level validation errors
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h3>{isEdit ? 'Edit Employee' : 'Add Employee'}</h3>

      {errors.general && <p className="error">{errors.general}</p>}

      <label>Name</label>
      <input name="name" value={form.name} onChange={handleChange} />
      {errors.name && <span className="error">{errors.name}</span>}

      <label>Email</label>
      <input name="email" type="email" value={form.email} onChange={handleChange} />
      {errors.email && <span className="error">{errors.email}</span>}

      <label>Department</label>
      <input name="department" value={form.department} onChange={handleChange} />

      <label>Salary</label>
      <input name="salary" type="number" min="0" value={form.salary} onChange={handleChange} />
      {errors.salary && <span className="error">{errors.salary}</span>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Update' : 'Save'}
        </button>
        <button type="button" className="btn" onClick={() => navigate('/')}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default EmployeeForm;