/**
 * AdminLTE's page scaffold: a title strip above the content well.
 *
 * Every admin screen shares it, so the class names live here rather than being
 * repeated nine times.
 */
export default function AdminPage({ title, subtitle, actions, children }) {
  return (
    <>
      <div className="app-content-header">
        <div className="container-fluid">
          <div className="row align-items-center g-2">
            <div className="col-sm">
              <h3 className="mb-0">{title}</h3>
              {subtitle && <small className="text-secondary">{subtitle}</small>}
            </div>
            {actions && <div className="col-sm-auto">{actions}</div>}
          </div>
        </div>
      </div>

      <div className="app-content">
        <div className="container-fluid">{children}</div>
      </div>
    </>
  )
}
