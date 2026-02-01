# data_pipeline.py - Data ingestion and processing pipeline
# Uses Apache Airflow for orchestration

import os
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.hooks.postgres import PostgresHook
import requests
import json
import psycopg2
from typing import Dict, List, Any
import pandas as pd
import numpy as np

# ==================== CONFIGURATION ====================

DEFAULT_ARGS = {
    'owner': 'laurenzo',
    'depends_on_past': False,
    'start_date': datetime(2026, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

# ==================== DATA SOURCE CONNECTORS ====================

class DataSourceManager:
    """Manages connections to various data sources"""

    def __init__(self):
        self.postgres_hook = PostgresHook(postgres_conn_id='laurenzo_db')

    def get_db_connection(self):
        return self.postgres_hook.get_conn()

class FinancialDataCollector:
    """
    Collects financial data from various sources
    In production: integrate with Pitchbook, Crunchbase, CapIQ, etc.
    """

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.pitchbook.com/v1"  # Example

    def fetch_company_financials(self, company_id: str) -> Dict:
        """Fetch latest financials for a company"""
        # In production, this would make real API calls
        # For now, this is a template

        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

        try:
            response = requests.get(
                f"{self.base_url}/companies/{company_id}/financials",
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error fetching financials for {company_id}: {e}")
            return None

    def fetch_funding_rounds(self, company_id: str) -> List[Dict]:
        """Fetch funding round history"""
        try:
            response = requests.get(
                f"{self.base_url}/companies/{company_id}/funding-rounds",
                headers={'Authorization': f'Bearer {self.api_key}'},
                timeout=30
            )
            response.raise_for_status()
            return response.json().get('rounds', [])
        except Exception as e:
            print(f"Error fetching funding rounds: {e}")
            return []

class SatelliteDataCollector:
    """
    Collects and analyzes satellite imagery
    In production: integrate with Planet Labs, Orbital Insight, etc.
    """

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.planet.com/data/v1"

    def analyze_parking_lot(self, latitude: float, longitude: float,
                           start_date: str, end_date: str) -> Dict:
        """
        Analyze parking lot activity from satellite imagery
        Returns vehicle count trends and activity metrics
        """

        # This would use actual computer vision on satellite images
        # Template for the API integration

        params = {
            'geometry': {
                'type': 'Point',
                'coordinates': [longitude, latitude]
            },
            'date_range': f"{start_date}/{end_date}",
            'item_types': ['PSScene4Band']
        }

        try:
            # Search for images
            response = requests.post(
                f"{self.base_url}/quick-search",
                auth=(self.api_key, ''),
                json=params,
                timeout=30
            )
            response.raise_for_status()

            images = response.json().get('features', [])

            # In production: download images and run CV models
            # For now, return template structure

            return {
                'images_analyzed': len(images),
                'vehicle_count_avg': 0,  # Would be calculated from CV
                'activity_delta': 0.0,   # Change vs previous period
                'quality': 'good',       # Image quality assessment
                'confidence': 0.85       # Model confidence
            }

        except Exception as e:
            print(f"Error analyzing satellite data: {e}")
            return None

class CreditDataCollector:
    """
    Collects business credit data
    In production: integrate with Dun & Bradstreet, Experian Business, etc.
    """

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.dnb.com/v1"

    def fetch_credit_score(self, duns_number: str) -> Dict:
        """Fetch business credit score and details"""

        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

        try:
            response = requests.get(
                f"{self.base_url}/data/duns/{duns_number}/risk",
                headers=headers,
                timeout=30
            )
            response.raise_for_status()

            data = response.json()

            return {
                'credit_score': data.get('score', 0),
                'paydex': data.get('paydex', 0),
                'trend': data.get('trend', 'stable'),
                'payment_history': data.get('payment_history', {}),
                'risk_class': data.get('risk_class', '')
            }

        except Exception as e:
            print(f"Error fetching credit data: {e}")
            return None

class WebScrapingCollector:
    """
    Scrapes web data: job postings, reviews, news mentions
    """

    def scrape_job_postings(self, company_name: str) -> int:
        """Count active job postings for company"""
        # Use Indeed API, LinkedIn API, or custom scraper
        # Template implementation

        try:
            # Example: LinkedIn API integration
            params = {
                'keywords': company_name,
                'location': '',
                'dateSincePosted': 'past30Days'
            }

            # This would make actual API calls
            # For now, return 0
            return 0

        except Exception as e:
            print(f"Error scraping job postings: {e}")
            return 0

    def scrape_company_reviews(self, company_name: str) -> Dict:
        """Scrape Glassdoor/Indeed reviews"""
        try:
            # Would use Glassdoor API or scraping
            return {
                'rating': 0.0,
                'review_count': 0,
                'sentiment_score': 0.0
            }
        except Exception as e:
            print(f"Error scraping reviews: {e}")
            return None

# ==================== VALUATION ENGINE ====================

class ValuationEngine:
    """
    Calculates company valuations using multiple methodologies
    """

    def __init__(self, db_conn):
        self.db_conn = db_conn

    def calculate_cca_valuation(self, asset_id: str,
                                financials: Dict) -> Dict:
        """
        Comparable Companies Analysis
        Find similar companies and apply median multiples
        """

        cursor = self.db_conn.cursor()

        # Get asset details
        cursor.execute("""
            SELECT type, sector, geography, revenue, ebitda
            FROM assets a
            LEFT JOIN private_equity_details pe ON a.id = pe.asset_id
            WHERE a.id = %s
        """, (asset_id,))

        asset = cursor.fetchone()
        if not asset:
            return None

        asset_type, sector, geography, revenue, ebitda = asset

        # Find comparable companies
        cursor.execute("""
            SELECT
                a.id,
                a.name,
                a.revenue,
                a.valuation,
                COALESCE(pe.ebitda, vc.arr, re.noi) as earnings,
                a.valuation::float / NULLIF(COALESCE(pe.ebitda, vc.arr, re.noi), 0) as multiple
            FROM assets a
            LEFT JOIN private_equity_details pe ON a.id = pe.asset_id
            LEFT JOIN venture_capital_details vc ON a.id = vc.asset_id
            LEFT JOIN real_estate_details re ON a.id = re.asset_id
            WHERE
                a.type = %s
                AND a.sector = %s
                AND a.id != %s
                AND a.revenue BETWEEN %s AND %s
            ORDER BY ABS(a.revenue - %s)
            LIMIT 10
        """, (asset_type, sector, asset_id,
              revenue * 0.5, revenue * 2.0, revenue))

        comparables = cursor.fetchall()

        if not comparables or len(comparables) < 3:
            return None

        # Calculate median multiple
        multiples = [c[5] for c in comparables if c[5] and c[5] > 0]
        if not multiples:
            return None

        median_multiple = np.median(multiples)

        # Apply to target company
        target_earnings = ebitda if ebitda else revenue * 0.15  # Assume 15% margin
        cca_valuation = target_earnings * median_multiple

        return {
            'value': int(cca_valuation),
            'multiple': float(median_multiple),
            'weight': 0.35,
            'methodology': {
                'comparables_count': len(comparables),
                'comparables': [
                    {
                        'name': c[1],
                        'revenue': c[2],
                        'multiple': float(c[5]) if c[5] else 0
                    } for c in comparables[:5]
                ]
            }
        }

    def calculate_dcf_valuation(self, asset_id: str,
                                financials: Dict) -> Dict:
        """
        Discounted Cash Flow Analysis
        Project future cash flows and discount to present value
        """

        # Simplified DCF calculation
        # In production: use detailed financial projections

        revenue = financials.get('revenue', 0)
        growth_rate = financials.get('growth_rate', 0.15)  # 15% default
        ebitda_margin = financials.get('ebitda_margin', 0.20)  # 20% default
        wacc = 0.12  # 12% weighted average cost of capital
        terminal_growth = 0.03  # 3% terminal growth
        projection_years = 5

        # Project cash flows
        cash_flows = []
        for year in range(1, projection_years + 1):
            projected_revenue = revenue * ((1 + growth_rate) ** year)
            projected_ebitda = projected_revenue * ebitda_margin
            # Simplified FCF = EBITDA * (1 - tax rate)
            fcf = projected_ebitda * 0.75
            discounted_fcf = fcf / ((1 + wacc) ** year)
            cash_flows.append(discounted_fcf)

        # Terminal value
        terminal_fcf = cash_flows[-1] * (1 + terminal_growth)
        terminal_value = terminal_fcf / (wacc - terminal_growth)
        discounted_terminal_value = terminal_value / ((1 + wacc) ** projection_years)

        dcf_valuation = sum(cash_flows) + discounted_terminal_value

        return {
            'value': int(dcf_valuation),
            'wacc': wacc,
            'weight': 0.20,
            'methodology': {
                'projection_years': projection_years,
                'growth_rate': growth_rate,
                'terminal_growth': terminal_growth,
                'npv_cash_flows': int(sum(cash_flows)),
                'terminal_value': int(discounted_terminal_value)
            }
        }

    def calculate_alt_data_adjustment(self, asset_id: str) -> Dict:
        """
        Calculate valuation adjustment based on alternative data signals
        """

        cursor = self.db_conn.cursor()

        cursor.execute("""
            SELECT satellite_data, credit_data, web_data, fleet_data
            FROM alternative_data
            WHERE asset_id = %s
        """, (asset_id,))

        result = cursor.fetchone()
        if not result:
            return {'value': 0, 'signal': 0, 'weight': 0.10}

        satellite, credit, web, fleet = result

        # Calculate composite signal (-1 to +1)
        signals = []

        if satellite:
            sat_delta = satellite.get('delta', 0)
            signals.append(sat_delta * 0.3)  # 30% weight

        if credit:
            # Normalize credit score (300-850) to -1 to +1
            credit_score = credit.get('score', 600)
            credit_signal = (credit_score - 600) / 250  # Center at 600
            signals.append(credit_signal * 0.25)  # 25% weight

        if web:
            sentiment = web.get('sentiment', 0)
            signals.append(sentiment * 0.25)  # 25% weight

        if fleet:
            utilization = fleet.get('utilization', 0.5)
            util_signal = (utilization - 0.5) * 2  # Center at 50%
            signals.append(util_signal * 0.20)  # 20% weight

        composite_signal = sum(signals) if signals else 0

        # Get base valuation to calculate adjustment
        cursor.execute("""
            SELECT valuation FROM assets WHERE id = %s
        """, (asset_id,))
        base_val = cursor.fetchone()[0]

        # Apply up to ±10% adjustment based on alt data
        adjustment = base_val * composite_signal * 0.10

        return {
            'value': int(adjustment),
            'signal': float(composite_signal),
            'weight': 0.10
        }

    def blend_valuation_methods(self, asset_id: str) -> Dict:
        """
        Combine all valuation methods into final blended valuation
        """

        # Get current financials
        cursor = self.db_conn.cursor()
        cursor.execute("""
            SELECT
                a.revenue,
                COALESCE(pe.ebitda, 0) as ebitda,
                a.metrics
            FROM assets a
            LEFT JOIN private_equity_details pe ON a.id = pe.asset_id
            WHERE a.id = %s
        """, (asset_id,))

        result = cursor.fetchone()
        if not result:
            return None

        revenue, ebitda, metrics = result
        financials = {
            'revenue': revenue,
            'ebitda': ebitda,
            **(metrics or {})
        }

        # Calculate each method
        cca = self.calculate_cca_valuation(asset_id, financials)
        dcf = self.calculate_dcf_valuation(asset_id, financials)
        alt_data = self.calculate_alt_data_adjustment(asset_id)

        # For precedent transactions (simplified - would query actual M&A data)
        precedent = {
            'value': int(revenue * 5.0) if revenue else 0,  # Simplified
            'multiple': 5.0,
            'weight': 0.35
        }

        # Blend valuations
        methods = [m for m in [cca, precedent, dcf, alt_data] if m]
        total_weight = sum(m['weight'] for m in methods)

        blended_valuation = sum(
            m['value'] * m['weight'] / total_weight
            for m in methods
        )

        # Calculate confidence score based on data quality
        cursor.execute("""
            SELECT overall_score FROM data_quality WHERE asset_id = %s
        """, (asset_id,))
        quality = cursor.fetchone()
        confidence = quality[0] if quality else 50

        return {
            'blended_valuation': int(blended_valuation),
            'confidence_score': confidence,
            'cca': cca,
            'precedent': precedent,
            'dcf': dcf,
            'alt_data': alt_data
        }

# ==================== AIRFLOW DAGS ====================

def ingest_financial_data(**context):
    """Airflow task: Ingest financial data from external sources"""

    dsm = DataSourceManager()
    conn = dsm.get_db_connection()
    cursor = conn.cursor()

    # Get list of assets to update
    cursor.execute("""
        SELECT id, name FROM assets
        WHERE last_data_update < NOW() - INTERVAL '24 hours'
        OR last_data_update IS NULL
        LIMIT 100
    """)

    assets = cursor.fetchall()

    collector = FinancialDataCollector(api_key=os.getenv('PITCHBOOK_API_KEY'))

    updated_count = 0
    for asset_id, name in assets:
        try:
            # Fetch latest financials
            financials = collector.fetch_company_financials(asset_id)
            if financials:
                # Update database
                cursor.execute("""
                    UPDATE assets
                    SET revenue = %s, last_data_update = NOW()
                    WHERE id = %s
                """, (financials.get('revenue'), asset_id))
                updated_count += 1
        except Exception as e:
            print(f"Error updating {asset_id}: {e}")
            continue

    conn.commit()
    conn.close()

    print(f"Updated {updated_count} assets with financial data")
    return updated_count

def collect_satellite_data(**context):
    """Airflow task: Collect and analyze satellite imagery"""

    dsm = DataSourceManager()
    conn = dsm.get_db_connection()
    cursor = conn.cursor()

    # Get assets with physical locations
    cursor.execute("""
        SELECT a.id, a.geography
        FROM assets a
        LEFT JOIN alternative_data ad ON a.id = ad.asset_id
        WHERE (ad.satellite_last_update < NOW() - INTERVAL '7 days'
               OR ad.satellite_last_update IS NULL)
        AND a.type IN ('private-equity', 'real-estate')
        LIMIT 50
    """)

    assets = cursor.fetchall()

    collector = SatelliteDataCollector(api_key=os.getenv('PLANET_API_KEY'))

    for asset_id, geography in assets:
        try:
            # Would geocode geography to lat/long
            # For now, skip implementation

            # Update satellite data
            cursor.execute("""
                INSERT INTO alternative_data (asset_id, satellite_data, satellite_last_update)
                VALUES (%s, %s, NOW())
                ON CONFLICT (asset_id)
                DO UPDATE SET satellite_data = %s, satellite_last_update = NOW()
            """, (asset_id, json.dumps({}), json.dumps({})))

        except Exception as e:
            print(f"Error collecting satellite data for {asset_id}: {e}")
            continue

    conn.commit()
    conn.close()

def calculate_valuations(**context):
    """Airflow task: Calculate valuations for all assets"""

    dsm = DataSourceManager()
    conn = dsm.get_db_connection()
    cursor = conn.cursor()

    engine = ValuationEngine(conn)

    # Get assets to value
    cursor.execute("""
        SELECT id FROM assets
        WHERE updated_at < NOW() - INTERVAL '24 hours'
        LIMIT 100
    """)

    assets = cursor.fetchall()

    for (asset_id,) in assets:
        try:
            valuation_result = engine.blend_valuation_methods(asset_id)

            if valuation_result:
                # Update assets table
                cursor.execute("""
                    UPDATE assets
                    SET valuation = %s, data_quality_score = %s, updated_at = NOW()
                    WHERE id = %s
                """, (valuation_result['blended_valuation'],
                      valuation_result['confidence_score'],
                      asset_id))

                # Insert into valuation_methodology
                cursor.execute("""
                    INSERT INTO valuation_methodology
                    (asset_id, cca_value, cca_weight, dcf_value, dcf_weight,
                     alt_data_value, alt_data_weight, blended_valuation, confidence_score)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (asset_id,
                      valuation_result['cca']['value'],
                      valuation_result['cca']['weight'],
                      valuation_result['dcf']['value'],
                      valuation_result['dcf']['weight'],
                      valuation_result['alt_data']['value'],
                      valuation_result['alt_data']['weight'],
                      valuation_result['blended_valuation'],
                      valuation_result['confidence_score']))

        except Exception as e:
            print(f"Error calculating valuation for {asset_id}: {e}")
            continue

    conn.commit()
    conn.close()

# Define DAG
with DAG(
    'laurenzo_data_pipeline',
    default_args=DEFAULT_ARGS,
    description='Main data pipeline for Laurenzo Terminal',
    schedule_interval='0 */6 * * *',  # Every 6 hours
    catchup=False
) as dag:

    task_ingest_financial = PythonOperator(
        task_id='ingest_financial_data',
        python_callable=ingest_financial_data
    )

    task_collect_satellite = PythonOperator(
        task_id='collect_satellite_data',
        python_callable=collect_satellite_data
    )

    task_calculate_valuations = PythonOperator(
        task_id='calculate_valuations',
        python_callable=calculate_valuations
    )

    # Define task dependencies
    [task_ingest_financial, task_collect_satellite] >> task_calculate_valuations
