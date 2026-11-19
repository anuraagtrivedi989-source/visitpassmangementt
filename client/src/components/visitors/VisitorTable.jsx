import React from 'react';
import { statusClass } from '../../utils/formatters.js';

export default function VisitorTable({ visitors, onOpen, isAdmin = false, onDelete }) {
  if (!visitors.length) {
    return <div className="empty-state"><span>♙</span><b>No visitors found</b><p>Register a visitor to see records here.</p></div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>VISITOR</th><th>PASS ID</th><th>VISIT DATE</th><th>STATUS</th><th /></tr></thead>
        <tbody>
          {visitors.map((visitor) => (
            <tr key={visitor._id}>
              <td><b>{visitor.fullName}</b><small>{visitor.hostName}</small></td>
              <td><code>{visitor.passId}</code></td>
              <td>{new Date(visitor.visitDate).toLocaleDateString()}</td>
              <td><span className={statusClass(visitor.status)}>{visitor.status}</span></td>
              <td>
                <button className="text-button" onClick={() => onOpen(visitor)}>Details →</button>
                {isAdmin && visitor.status === 'checked-out' && onDelete && (
                  <button
                    className="text-button danger-text"
                    style={{ marginLeft: 8 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(visitor);
                    }}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
