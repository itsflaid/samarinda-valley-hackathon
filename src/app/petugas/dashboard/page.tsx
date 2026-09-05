"use client";
export default function AdminDashboardPage() {

  return (
    <>
      <section>
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Nakes</p>
          <h2 className="mt-2 text-2xl font-bold">
            {Number(0)}
          </h2>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Petugas</p>
          <h2 className="mt-2 text-2xl font-bold">
            {Number(0)}
          </h2>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Bulan ini bertambah</p>
          <h2 className="mt-2 text-2xl font-bold">
                    
             {Number(0)}
          </h2>
        </div>

      </section>

      {/* <section>
        <ChartAreaInteractive />
      </section> */}
    </>
  );
}