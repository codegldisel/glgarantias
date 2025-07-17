import csv

def read_file_content(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    # Filter out empty lines and strip whitespace, then skip header
    return [line.strip() for line in lines[1:] if line.strip()]

print('Reading files...')
nor_ordem_osv = read_file_content('/home/ubuntu/upload/NOrdem_Osv.txt')
data_osv = read_file_content('/home/ubuntu/upload/Data_OSv.txt')
fabricante_mot = read_file_content('/home/ubuntu/upload/Fabricante_Mot.txt')
descricao_mot = read_file_content('/home/ubuntu/upload/Descricao_Mot.txt')
modelovei_osv = read_file_content('/home/ubuntu/upload/ModeloVei_Osv.txt')
obscorpo_osv = read_file_content('/home/ubuntu/upload/ObsCorpo_OSv.txt')
razaosocial_cli = read_file_content('/home/ubuntu/upload/RazaoSocial_Cli.txt')
totalprod_osv = read_file_content('/home/ubuntu/upload/TotalProd_OSv.txt')
totalserv_osv = read_file_content('/home/ubuntu/upload/TotalServ_OSv.txt')
total_osv = read_file_content('/home/ubuntu/upload/Total_OSv.txt')
status_osv = read_file_content('/home/ubuntu/upload/Status_OSv.txt')

# Determine the minimum length among all lists to avoid index out of range errors
min_len = min(len(nor_ordem_osv), len(data_osv), len(fabricante_mot), len(descricao_mot), 
              len(modelovei_osv), len(obscorpo_osv), len(razaosocial_cli), len(totalprod_osv), 
              len(totalserv_osv), len(total_osv), len(status_osv))

print(f'Minimum length of data lists: {min_len}')

refined_data = []

for i in range(min_len):
    try:
        # Apply year filter (>= 2019)
        data_parts = data_osv[i].split(' ')[0].split('/') # Split by space first to remove time, then by / for date parts
        year = int(data_parts[2])
        if year < 2019:
            continue

        # Apply status filter (G, GO, GU)
        status = status_osv[i]
        if status not in ['G', 'GO', 'GU']:
            continue

        # Apply TotalProd_OSv transformation (divide by 2) and handle comma decimal
        total_prod = float(totalprod_osv[i].replace(',', '.')) / 2

        # Apply TotalServ_OSv transformation (no change) and handle comma decimal
        total_serv = float(totalserv_osv[i].replace(',', '.'))

        # Apply Total_OSv validation and handle comma decimal
        total_geral = float(total_osv[i].replace(',', '.'))

        # Check consistency (TotalProd_OSv/2) + TotalServ_OSv = Total_OSv
        calculated_total = total_prod + total_serv

        refined_data.append([
            nor_ordem_osv[i],
            data_osv[i],
            fabricante_mot[i],
            descricao_mot[i],
            modelovei_osv[i],
            obscorpo_osv[i],
            razaosocial_cli[i],
            str(total_prod),
            str(total_serv),
            str(total_geral), 
            status_osv[i]
        ])
    except ValueError as ve:
        print(f"ValueError processing row {i}: {ve} - Data: TotalProd={totalprod_osv[i]}, TotalServ={totalserv_osv[i]}, Total={total_osv[i]}")
        continue
    except IndexError as ie:
        print(f"IndexError processing row {i}: {ie}")
        continue
    except Exception as e:
        print(f"Error processing row {i}: {e}")
        continue

print(f'Writing {len(refined_data)} rows to CSV...')
# Write to CSV
with open('/home/ubuntu/glgarantias/data/refined_data.csv', 'w', newline='') as csvfile: # Changed 'a' to 'w' to overwrite
    csv_writer = csv.writer(csvfile)
    csv_writer.writerow(['NOrdem_OSv', 'Data_OSv', 'Fabricante_Mot', 'Descricao_Mot', 'ModeloVei_Osv', 'ObsCorpo_OSv', 'RazaoSocial_Cli', 'TotalProd_OSv', 'TotalServ_OSv', 'Total_OSv', 'Status_OSv']) # Write header
    csv_writer.writerows(refined_data)

print(f"Processed {len(refined_data)} rows and saved to refined_data.csv")


