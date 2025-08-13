install.packages(c("dplyr", "readr", "stringr", "janitor", "tidyr", "AMR"))
library(dplyr)
library(readr)
library(stringr)
library(janitor)
library(tidyr)
library(AMR)
# === Antibiotic column standardization dictionary ===
antibiotic_lookup <- c(
  # Aminopenicillins
  "AMPICILLIN" = "AMP", "AMP" = "AMP", "Ampicillin" = "AMP",
  "AMOXICILLIN" = "AMX", "AMX" = "AMX", "Amoxicillin" = "AMX",
  
  # Beta-lactam combinations
  "Amoxicillin-clavulanic acid" = "AMC", "Amoxicillin/Clavulanic acid" = "AMC", 
  "Amoxicillin- clavulanic acid" = "AMC",
  "AMC" = "AMC", "Augmentin" = "AMC", "AMOXICILLIN_CLAVULANATE" = "AMC",
  "Ampicillin/ Sulbactam" = "SAM", "SAM" = "SAM",
  "Ticarcillin/Clavulanic Acid" = "TIM", "TIM_MIC" = "TIM", "TIM" = "TIM",
  
  # Cephalosporins
  "Cefepime" = "FEP", "FEP_MIC" = "FEP", "FEP" = "FEP",
  "Ceftazidime" = "CAZ", "CAZ_MIC" = "CAZ", "CAZ" = "CAZ",
  "Ceftriaxone" = "CRO", "CRO" = "CRO",
  "Cefuroxime" = "CXM", "CEFUROXIME" = "CXM", "CXM" = "CXM",
  "Cefotaxime" = "CTX", "CTX" = "CTX",
  "Cefaclor" = "CEC", "CEFACLOR" = "CEC", "CEC" = "CEC",
  "Ceftaroline" = "CPT", "CPT" = "CPT",
  "Cefiderocol" = "FDC", "FDC" = "FDC",
  
  # Monobactams
  "Aztreonam" = "ATM", "ATM" = "ATM",
  "Aztreonam/ Avibactam" = "AZA", "AZA" = "AZA",
  
  # Carbapenems
  "Meropenem" = "MEM", "MEM_MIC" = "MEM", "MEM" = "MEM",
  "Imipenem" = "IPM", "IPM_MIC" = "IPM", "IPM" = "IPM",
  "Meropenem/ Vaborbactam at 8" = "MEV", "MEV" = "MEV",
  "Imipenem/ Relebactam" = "IMR", "IMR" = "IMR",
  
  # Fluoroquinolones
  "Ciprofloxacin" = "CIP", "CIP_MIC" = "CIP", "CIP" = "CIP",
  "Levofloxacin" = "LVX", "LVX_MIC" = "LVX", "LVX" = "LVX", "LEV" = "LVX", "LEVOFLOXACIN" = "LVX",
  "OFX" = "OFX", "MXF" = "MXF", "MOXIFLOXACIN" = "MXF", "Moxifloxacin" = "MXF",
  
  # Aminoglycosides
  "Amikacin" = "AMK", "AMI" = "AMK", "AMIKACIN" = "AMK",
  "Gentamicin" = "GEN", "GM_MIC" = "GEN", "GEN" = "GEN",
  "KAN" = "KAN", "CAP" = "CAP", "CAPREOMYCIN" = "CAP",
  
  # Tetracyclines
  "Minocycline" = "MIN", "MIN" = "MIN",
  "Doxycycline" = "DOX", "DOX" = "DOX",
  "Tetracycline" = "TET", "TET" = "TET",
  "Tigecycline" = "TGC", "TGC" = "TGC",
  "Omadacycline" = "OMC", "OMC" = "OMC",
  
  # Others
  "C_MIC" = "CHL", "CL_MIC" = "CLI", "CLINDAMYCIN" = "CLI", "Clindamycin" = "CLI",
  "Sulbactam" = "SLB", "Sulbactam/514 at 4 mcg/ml" = "SLB", "SLB" = "SLB",
  "SXT_MIC" = "SXT", "TRIMETHOPRIM_SULFA" = "SXT", "Trimethoprim/ Sulfamethoxazole" = "SXT",
  "Linezolid" = "LZD", "LZD" = "LZD",
  "Daptomycin" = "DAP", "DAP" = "DAP",
  "Vancomycin" = "VAN", "VAN" = "VAN",
  "Teicoplanin" = "TEC", "TEC" = "TEC",
  "Azithromycin" = "AZM", "AZITHROMYCIN" = "AZM", "AZM" = "AZM",
  "Clarithromycin" = "CLR", "CLARITHROMYCIN" = "CLR", "CLA" = "CLR",
  "Erythromycin" = "ERY", "ERYTHROMYCIN" = "ERY", "ERY" = "ERY",
  
  # Beta-lactam/beta-lactamase combinations
  "Piperacillin-tazobactam" = "TZP", "Piperacillin/\ntazobactam" = "TZP", "TZP_MIC" = "TZP","Piperacillin- tazobactam" = "TZP",
  
  # Investigational
  "Ceftazidime/ Avibactam" = "CZA", "CZA" = "CZA",
  "Ceftolozane/ Tazobactam" = "C/T", "C/T" = "Ceftolozane Tazobactam",
  "EMB" = "Ethambutol",
  # Others from TB panel (J&J)
  "INH" = "INH", "RMP" = "RIF", "EMB" = "EMB", "CFZ" = "CFZ", "BDQ Broth" = "BDQ",
  
  # Others
  "Oxacillin" = "OXA", "OXA" = "OXA", "Penicillin" = "PEN", "PENICILLIN" = "PEN", "PEN" = "PEN",
  "DIN" = "DIN", "FIX" = "FIX", "AXO" = "AXO", "POD" = "POD", "CDN" = "CLI",
  
  # Add to antibiotic_lookup
  "Polymyxin B" = "COL",
  "Polymyxin B MIC (mcg/ml)" = "COL",
  "MI_MIC" = "MI",  
  "Amoxicillin-\nclavulanic acid" = "AMC",
  "Piperacillin-\ntazobactam" = "TZP",
  "Trimethoprim-sulfamethoxazole" = "SXT",
  "Colistin" = "COL",
  "COL" = "COL",
  "AXO" = "CRO",        # Ceftriaxone
  "Ceftriaxone" = "CRO",
  "CEFTRIAXONE" = "CRO",
  "FIX" = "CFM",        # Cefixime
  "Cefixime" = "CFM",
  "POD" = "CPD",        # Cefpodoxime
  "Cefpodoxime" = "CPD",
  "Cefdinir" = "CDR",  # Added: Cefdinir
  "DIN" = "CDR",    
  "MI" = "MNO",         # Minocycline
  "Minocycline" = "MNO"
)


# === Helper: Clean column names ===
clean_names_strict <- function(df) {
  colnames(df) <- gsub("\\n", " ", colnames(df))
  colnames(df) <- gsub("\\s+", " ", colnames(df))
  df
}

# === Helper: Standardize organism ===
process_organisms <- function(df, org_col) {
  df <- df %>%
    mutate(.organism = suppressWarnings(as.mo(.[[org_col]]))) %>%
    filter(!is.na(.organism))
  return(df)
}

# === Helper: Detect antibiotic columns using lookup ===
find_antibiotic_columns <- function(df) {
  colnames(df)[colnames(df) %in% names(antibiotic_lookup)]
}

# === Helper: Rename antibiotic columns to standard 3-letter codes ===
standardize_ab_names <- function(df) {
  matched_cols <- intersect(names(antibiotic_lookup), colnames(df))
  renaming_vector <- setNames(antibiotic_lookup[matched_cols], matched_cols)
  df <- df %>% rename_with(~ renaming_vector[.x], .cols = matched_cols)
  return(df)
}

# === MIC → SIR converter ===
mic_to_sir <- function(df) {
  mic_cols <- intersect(names(df), unique(antibiotic_lookup))
  for (col in mic_cols) {
    ab <- suppressWarnings(as.ab(col))
    if (!is.na(ab)) {
      df[[paste0(col, "_SIR")]] <- suppressWarnings(as.sir(as.mic(df[[col]]), mo = df$.organism, ab = ab, , guideline = "CLSI"))
    }
  }
  return(df)
}

# === Files and organism columns ===
# === Replace with path to your datasets and comment out or delete unaivalable ones===
files <- list(
  Shionogi = "/Users/mac/Downloads/Vivli datasets/Shionogi_MIC_data.csv",
  PLEA_I = "/Users/mac/Downloads/Vivli datasets/PLEA_I.csv",
  GASAR_II = "/Users/mac/Downloads/Vivli datasets/GASAR_Study_II.csv",
  GASAR_III = "/Users/mac/Downloads/Vivli datasets/GASAR_Study_III.csv",
  Venatorx = "/Users/mac/Downloads/Vivli datasets/Venatorx_MIC_data.csv",
  Keystone = "/Users/mac/Downloads/Vivli datasets/KEYSTONE.csv",
  JJ = "/Users/mac/Downloads/Vivli datasets/J&J.csv",
  INNOVIVA = "/Users/mac/Downloads/Vivli datasets/INNOVIVA_Acinetobacter.csv",
  GSK_SOAR = "/Users/mac/Downloads/Vivli datasets/GSK_SOAR_201910.csv",
  GSK_2018 = "/Users/mac/Downloads/Vivli datasets/gsk_201818.csv"
)
# === Change to unique species columns in your own datasets ===
organism_cols <- list(
  Shionogi = "Organism Name",
  PLEA_I = "Species",
  GASAR_II = "Species",
  GASAR_III = "Species",
  Venatorx = "Organism",
  Keystone = "Organism",
  JJ = "Organism",
  INNOVIVA = "OrganismName",
  GSK_SOAR = "Organism",
  GSK_2018 = "ORGANISMNAME"
)

processed_data <- list()

for (dataset in names(files)) {
  message("\nProcessing: ", dataset)
  
  mic_data <- tryCatch({
    read_csv(files[[dataset]], show_col_types = FALSE)
  }, error = function(e) {
    warning("Could not read file: ", files[[dataset]])
    return(NULL)
  })
  
  if (is.null(mic_data)) next
  
  mic_data <- clean_names_strict(mic_data)
  
  org_col <- organism_cols[[dataset]]
  if (!org_col %in% colnames(mic_data)) {
    warning("Missing organism column in: ", dataset)
    next
  }
  
  mic_data <- process_organisms(mic_data, org_col)
  
  # Report unique species labels
  message("Unique organism labels: ", paste(unique(mic_data[[org_col]]), collapse = " | "))
  
  # Rename antibiotic columns
  mic_data <- standardize_ab_names(mic_data)
  
  # Convert MIC values to SIR
  mic_data <- mic_to_sir(mic_data)
  
  # Save output
  write_csv(mic_data, paste0("Processed_", dataset, ".csv"))
  processed_data[[dataset]] <- mic_data
}
