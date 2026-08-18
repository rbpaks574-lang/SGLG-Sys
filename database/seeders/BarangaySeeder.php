<?php

namespace Database\Seeders;

use App\Models\Barangay;
use Illuminate\Database\Seeder;

class BarangaySeeder extends Seeder
{
    public function run(): void
    {
        $barangays = [
            ['name' => 'Acacia', 'code' => 'BRGY-001', 'captain_name' => 'Hon. Roberto M. Ramos', 'contact_number' => '0917-111-2201', 'pollution_status' => 'Low / Managed', 'population' => 2840, 'compliance_score' => 92.50],
            ['name' => 'Adlas', 'code' => 'BRGY-002', 'captain_name' => 'Hon. Maria Elena Santos', 'contact_number' => '0917-111-2202', 'pollution_status' => 'Low / Managed', 'population' => 4510, 'compliance_score' => 95.00],
            ['name' => 'Anahaw 1', 'code' => 'BRGY-003', 'captain_name' => 'Hon. Danilo P. Cruz', 'contact_number' => '0917-111-2203', 'pollution_status' => 'Moderate', 'population' => 1950, 'compliance_score' => 88.00],
            ['name' => 'Anahaw 2', 'code' => 'BRGY-004', 'captain_name' => 'Hon. Antonio G. Reyes', 'contact_number' => '0917-111-2204', 'pollution_status' => 'Low / Managed', 'population' => 2100, 'compliance_score' => 86.50],
            ['name' => 'Balite 1', 'code' => 'BRGY-005', 'captain_name' => 'Hon. Ferdinand T. Garcia', 'contact_number' => '0917-111-2205', 'pollution_status' => 'Low / Managed', 'population' => 3420, 'compliance_score' => 89.00],
            ['name' => 'Balite 2', 'code' => 'BRGY-006', 'captain_name' => 'Hon. Rolando B. Mendoza', 'contact_number' => '0917-111-2206', 'pollution_status' => 'Low / Managed', 'population' => 3180, 'compliance_score' => 91.00],
            ['name' => 'Balubad', 'code' => 'BRGY-007', 'captain_name' => 'Hon. Vicente K. Villanueva', 'contact_number' => '0917-111-2207', 'pollution_status' => 'Moderate', 'population' => 5240, 'compliance_score' => 94.20],
            ['name' => 'Banaba', 'code' => 'BRGY-008', 'captain_name' => 'Hon. Josefina C. Mercado', 'contact_number' => '0917-111-2208', 'pollution_status' => 'Low / Managed', 'population' => 2670, 'compliance_score' => 87.50],
            ['name' => 'Barangay I (Poblacion 1)', 'code' => 'BRGY-009', 'captain_name' => 'Hon. Eduardo S. Medina', 'contact_number' => '0917-111-2209', 'pollution_status' => 'Low / Managed', 'population' => 6120, 'compliance_score' => 98.00],
            ['name' => 'Barangay II (Poblacion 2)', 'code' => 'BRGY-010', 'captain_name' => 'Hon. Corazon L. Bautista', 'contact_number' => '0917-111-2210', 'pollution_status' => 'Low / Managed', 'population' => 4890, 'compliance_score' => 96.50],
            ['name' => 'Barangay III (Poblacion 3)', 'code' => 'BRGY-011', 'captain_name' => 'Hon. Manuel R. Castro', 'contact_number' => '0917-111-2211', 'pollution_status' => 'Low / Managed', 'population' => 3950, 'compliance_score' => 94.00],
            ['name' => 'Barangay IV (Poblacion 4)', 'code' => 'BRGY-012', 'captain_name' => 'Hon. Teresa A. Navarro', 'contact_number' => '0917-111-2212', 'pollution_status' => 'Low / Managed', 'population' => 4320, 'compliance_score' => 93.00],
            ['name' => 'Barangay V (Poblacion 5)', 'code' => 'BRGY-013', 'captain_name' => 'Hon. Jaime D. Gomez', 'contact_number' => '0917-111-2213', 'pollution_status' => 'Low / Managed', 'population' => 5100, 'compliance_score' => 95.80],
            ['name' => 'Batas', 'code' => 'BRGY-014', 'captain_name' => 'Hon. Ricardo F. Morales', 'contact_number' => '0917-111-2214', 'pollution_status' => 'Low / Managed', 'population' => 1850, 'compliance_score' => 84.00],
            ['name' => 'Biga 1', 'code' => 'BRGY-015', 'captain_name' => 'Hon. Artemio V. Alcantara', 'contact_number' => '0917-111-2215', 'pollution_status' => 'Low / Managed', 'population' => 7820, 'compliance_score' => 97.40],
            ['name' => 'Biga 2', 'code' => 'BRGY-016', 'captain_name' => 'Hon. Lourdes J. Pascual', 'contact_number' => '0917-111-2216', 'pollution_status' => 'Low / Managed', 'population' => 6450, 'compliance_score' => 93.50],
            ['name' => 'Biluso', 'code' => 'BRGY-017', 'captain_name' => 'Hon. Dominador H. Toledo', 'contact_number' => '0917-111-2217', 'pollution_status' => 'Low / Managed', 'population' => 8910, 'compliance_score' => 96.00],
            ['name' => 'Bucal', 'code' => 'BRGY-018', 'captain_name' => 'Hon. Gerardo M. Luna', 'contact_number' => '0917-111-2218', 'pollution_status' => 'Low / Managed', 'population' => 3120, 'compliance_score' => 88.50],
            ['name' => 'Buho', 'code' => 'BRGY-019', 'captain_name' => 'Hon. Oscar E. Domingo', 'contact_number' => '0917-111-2219', 'pollution_status' => 'Moderate', 'population' => 4200, 'compliance_score' => 85.00],
            ['name' => 'Bulihan', 'code' => 'BRGY-020', 'captain_name' => 'Hon. Ernesto S. Javier', 'contact_number' => '0917-111-2220', 'pollution_status' => 'Low / Managed', 'population' => 14500, 'compliance_score' => 91.50],
            ['name' => 'Cabangaan', 'code' => 'BRGY-021', 'captain_name' => 'Hon. Wilson P. Aquino', 'contact_number' => '0917-111-2221', 'pollution_status' => 'Low / Managed', 'population' => 2400, 'compliance_score' => 86.00],
            ['name' => 'Carmen', 'code' => 'BRGY-022', 'captain_name' => 'Hon. Gregorio N. Diaz', 'contact_number' => '0917-111-2222', 'pollution_status' => 'Low / Managed', 'population' => 3650, 'compliance_score' => 90.00],
            ['name' => 'Haba', 'code' => 'BRGY-023', 'captain_name' => 'Hon. Severino T. Ramos', 'contact_number' => '0917-111-2223', 'pollution_status' => 'Low / Managed', 'population' => 1980, 'compliance_score' => 87.00],
            ['name' => 'Hoyo', 'code' => 'BRGY-024', 'captain_name' => 'Hon. Renato L. Salazar', 'contact_number' => '0917-111-2224', 'pollution_status' => 'Low / Managed', 'population' => 2150, 'compliance_score' => 89.50],
            ['name' => 'Iba', 'code' => 'BRGY-025', 'captain_name' => 'Hon. Alberto C. Samson', 'contact_number' => '0917-111-2225', 'pollution_status' => 'Low / Managed', 'population' => 3340, 'compliance_score' => 92.00],
            ['name' => 'Inchican', 'code' => 'BRGY-026', 'captain_name' => 'Hon. Mario B. Cortez', 'contact_number' => '0917-111-2226', 'pollution_status' => 'Low / Managed', 'population' => 4780, 'compliance_score' => 93.80],
            ['name' => 'Kalubkob', 'code' => 'BRGY-027', 'captain_name' => 'Hon. Efren G. Valenzuela', 'contact_number' => '0917-111-2227', 'pollution_status' => 'Low / Managed', 'population' => 2900, 'compliance_score' => 88.00],
            ['name' => 'Kaong', 'code' => 'BRGY-028', 'captain_name' => 'Hon. Teodoro M. Dela Cruz', 'contact_number' => '0917-111-2228', 'pollution_status' => 'Low / Managed', 'population' => 3890, 'compliance_score' => 90.50],
            ['name' => 'Lalaan 1', 'code' => 'BRGY-029', 'captain_name' => 'Hon. Bernardo R. Torres', 'contact_number' => '0917-111-2229', 'pollution_status' => 'Low / Managed', 'population' => 5600, 'compliance_score' => 94.50],
            ['name' => 'Lalaan 2', 'code' => 'BRGY-030', 'captain_name' => 'Hon. Nestor K. Aguilar', 'contact_number' => '0917-111-2230', 'pollution_status' => 'Low / Managed', 'population' => 4950, 'compliance_score' => 91.00],
            ['name' => 'Litlit', 'code' => 'BRGY-031', 'captain_name' => 'Hon. Danilo V. Beltran', 'contact_number' => '0917-111-2231', 'pollution_status' => 'Low / Managed', 'population' => 2300, 'compliance_score' => 85.50],
            ['name' => 'Lucsuhin', 'code' => 'BRGY-032', 'captain_name' => 'Hon. Wilfredo S. Perez', 'contact_number' => '0917-111-2232', 'pollution_status' => 'Low / Managed', 'population' => 6100, 'compliance_score' => 95.20],
            ['name' => 'Lumil', 'code' => 'BRGY-033', 'captain_name' => 'Hon. Rodrigo H. Guzman', 'contact_number' => '0917-111-2233', 'pollution_status' => 'Low / Managed', 'population' => 4150, 'compliance_score' => 89.80],
            ['name' => 'Maguyam', 'code' => 'BRGY-034', 'captain_name' => 'Hon. Felix A. Serrano', 'contact_number' => '0917-111-2234', 'pollution_status' => 'Moderate', 'population' => 7300, 'compliance_score' => 90.00],
            ['name' => 'Malabag', 'code' => 'BRGY-035', 'captain_name' => 'Hon. Salvador D. Ocampo', 'contact_number' => '0917-111-2235', 'pollution_status' => 'Low / Managed', 'population' => 5400, 'compliance_score' => 92.40],
            ['name' => 'Malaking Tatiao', 'code' => 'BRGY-036', 'captain_name' => 'Hon. Emmanuel P. Rosales', 'contact_number' => '0917-111-2236', 'pollution_status' => 'Low / Managed', 'population' => 3100, 'compliance_score' => 88.00],
            ['name' => 'Mataas na Burol', 'code' => 'BRGY-037', 'captain_name' => 'Hon. Armando C. Mariano', 'contact_number' => '0917-111-2237', 'pollution_status' => 'Low / Managed', 'population' => 3850, 'compliance_score' => 91.20],
            ['name' => 'Munting Ilog', 'code' => 'BRGY-038', 'captain_name' => 'Hon. Francisco J. Espiritu', 'contact_number' => '0917-111-2238', 'pollution_status' => 'Low / Managed', 'population' => 4600, 'compliance_score' => 89.00],
            ['name' => 'Narra 1', 'code' => 'BRGY-039', 'captain_name' => 'Hon. Gilbert T. Mendoza', 'contact_number' => '0917-111-2239', 'pollution_status' => 'Low / Managed', 'population' => 2750, 'compliance_score' => 87.00],
            ['name' => 'Narra 2', 'code' => 'BRGY-040', 'captain_name' => 'Hon. Pedro L. Soriano', 'contact_number' => '0917-111-2240', 'pollution_status' => 'Low / Managed', 'population' => 2450, 'compliance_score' => 86.50],
            ['name' => 'Narra 3', 'code' => 'BRGY-041', 'captain_name' => 'Hon. Guillermo E. Tan', 'contact_number' => '0917-111-2241', 'pollution_status' => 'Low / Managed', 'population' => 2200, 'compliance_score' => 85.00],
            ['name' => 'Paligawan', 'code' => 'BRGY-042', 'captain_name' => 'Hon. Isagani M. Ferrer', 'contact_number' => '0917-111-2242', 'pollution_status' => 'Low / Managed', 'population' => 1950, 'compliance_score' => 84.50],
            ['name' => 'Pasong Langka', 'code' => 'BRGY-043', 'captain_name' => 'Hon. Christopher B. Ramos', 'contact_number' => '0917-111-2243', 'pollution_status' => 'Low / Managed', 'population' => 3700, 'compliance_score' => 90.00],
            ['name' => 'Pooc 1', 'code' => 'BRGY-044', 'captain_name' => 'Hon. Victoriano S. Santos', 'contact_number' => '0917-111-2244', 'pollution_status' => 'Low / Managed', 'population' => 2800, 'compliance_score' => 88.00],
            ['name' => 'Pooc 2', 'code' => 'BRGY-045', 'captain_name' => 'Hon. Angelito D. Cruz', 'contact_number' => '0917-111-2245', 'pollution_status' => 'Low / Managed', 'population' => 2600, 'compliance_score' => 87.20],
            ['name' => 'Pulong Bunga', 'code' => 'BRGY-046', 'captain_name' => 'Hon. Ramon G. Castillo', 'contact_number' => '0917-111-2246', 'pollution_status' => 'Low / Managed', 'population' => 3150, 'compliance_score' => 93.00],
            ['name' => 'Pulong Saging', 'code' => 'BRGY-047', 'captain_name' => 'Hon. Joel V. Reyes', 'contact_number' => '0917-111-2247', 'pollution_status' => 'Low / Managed', 'population' => 2350, 'compliance_score' => 86.80],
            ['name' => 'Puting Kahoy', 'code' => 'BRGY-048', 'captain_name' => 'Hon. Hernando M. Almeda', 'contact_number' => '0917-111-2248', 'pollution_status' => 'Low / Managed', 'population' => 4500, 'compliance_score' => 94.00],
            ['name' => 'Sabutan', 'code' => 'BRGY-049', 'captain_name' => 'Hon. Leonilo P. Garcia', 'contact_number' => '0917-111-2249', 'pollution_status' => 'Low / Managed', 'population' => 3900, 'compliance_score' => 91.50],
            ['name' => 'San Miguel 1', 'code' => 'BRGY-050', 'captain_name' => 'Hon. Danilo R. Lopez', 'contact_number' => '0917-111-2250', 'pollution_status' => 'Low / Managed', 'population' => 3200, 'compliance_score' => 89.00],
            ['name' => 'San Miguel 2', 'code' => 'BRGY-051', 'captain_name' => 'Hon. Jose L. Herrera', 'contact_number' => '0917-111-2251', 'pollution_status' => 'Low / Managed', 'population' => 2950, 'compliance_score' => 88.40],
            ['name' => 'San Vicente 1', 'code' => 'BRGY-052', 'captain_name' => 'Hon. Aurelio C. David', 'contact_number' => '0917-111-2252', 'pollution_status' => 'Low / Managed', 'population' => 5200, 'compliance_score' => 93.20],
            ['name' => 'San Vicente 2', 'code' => 'BRGY-053', 'captain_name' => 'Hon. Mateo J. Rivera', 'contact_number' => '0917-111-2253', 'pollution_status' => 'Low / Managed', 'population' => 4600, 'compliance_score' => 92.00],
            ['name' => 'Santol', 'code' => 'BRGY-054', 'captain_name' => 'Hon. Edgardo F. Bautista', 'contact_number' => '0917-111-2254', 'pollution_status' => 'Low / Managed', 'population' => 3400, 'compliance_score' => 90.00],
            ['name' => 'Tartaria', 'code' => 'BRGY-055', 'captain_name' => 'Hon. Crispin K. Villanueva', 'contact_number' => '0917-111-2255', 'pollution_status' => 'Low / Managed', 'population' => 6700, 'compliance_score' => 95.50],
            ['name' => 'Tibig', 'code' => 'BRGY-056', 'captain_name' => 'Hon. Wilfredo B. Manalo', 'contact_number' => '0917-111-2256', 'pollution_status' => 'Low / Managed', 'population' => 4800, 'compliance_score' => 91.80],
            ['name' => 'Toledo', 'code' => 'BRGY-057', 'captain_name' => 'Hon. Arnaldo S. Dizon', 'contact_number' => '0917-111-2257', 'pollution_status' => 'Low / Managed', 'population' => 2500, 'compliance_score' => 87.00],
            ['name' => 'Tubuan 1', 'code' => 'BRGY-058', 'captain_name' => 'Hon. Reynaldo G. Pineda', 'contact_number' => '0917-111-2258', 'pollution_status' => 'Low / Managed', 'population' => 3300, 'compliance_score' => 89.20],
            ['name' => 'Tubuan 2', 'code' => 'BRGY-059', 'captain_name' => 'Hon. Mario C. Miranda', 'contact_number' => '0917-111-2259', 'pollution_status' => 'Low / Managed', 'population' => 2900, 'compliance_score' => 88.00],
            ['name' => 'Ulat', 'code' => 'BRGY-060', 'captain_name' => 'Hon. Lorenzo T. Gutierrez', 'contact_number' => '0917-111-2260', 'pollution_status' => 'Low / Managed', 'population' => 3100, 'compliance_score' => 90.20],
            ['name' => 'Yakal', 'code' => 'BRGY-061', 'captain_name' => 'Hon. Nelson D. Salcedo', 'contact_number' => '0917-111-2261', 'pollution_status' => 'Low / Managed', 'population' => 2700, 'compliance_score' => 87.80],
            ['name' => 'Carmen (Zone)', 'code' => 'BRGY-062', 'captain_name' => 'Hon. Romulo A. Perez', 'contact_number' => '0917-111-2262', 'pollution_status' => 'Low / Managed', 'population' => 2400, 'compliance_score' => 86.00],
            ['name' => 'Malaking Tatiao Ext.', 'code' => 'BRGY-063', 'captain_name' => 'Hon. Arsenio B. Cruz', 'contact_number' => '0917-111-2263', 'pollution_status' => 'Low / Managed', 'population' => 1900, 'compliance_score' => 85.00],
            ['name' => 'Pasong Camachile', 'code' => 'BRGY-064', 'captain_name' => 'Hon. Ernesto M. Samson', 'contact_number' => '0917-111-2264', 'pollution_status' => 'Low / Managed', 'population' => 2300, 'compliance_score' => 86.20],
        ];

        foreach ($barangays as $b) {
            Barangay::updateOrCreate(['name' => $b['name']], $b);
        }
    }
}
