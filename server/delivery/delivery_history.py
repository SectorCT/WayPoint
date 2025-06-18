from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Sum, Count
from django.contrib.auth import get_user_model
from .models import DeliveryHistory, Package, RouteAssignment
from .serializers import DeliveryHistorySerializer, DeliveryHistorySummarySerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .permissions import IsManager
from datetime import timedelta

User = get_user_model()


class CreateDeliveryHistoryView(APIView):
    """
    Create delivery history when a route is finished
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]

    def post(self, request):
        try:
            driver_username = request.data.get('username')
            duration_hours = request.data.get('duration_hours', 0)
            
            if not driver_username:
                return Response(
                    {"error": "Driver username is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get the driver
            try:
                driver = User.objects.get(username=driver_username)
            except User.DoesNotExist:
                return Response(
                    {"error": "Driver not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            # Get the active route for this driver
            try:
                route = RouteAssignment.objects.get(driver=driver, isActive=True)
            except RouteAssignment.DoesNotExist:
                return Response(
                    {"error": "No active route found for this driver"}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            # Get delivered packages for this route
            delivered_packages = Package.objects.filter(
                packageID__in=[pkg.get('packageID') for pkg in route.packageSequence if pkg.get('packageID') != 'ADMIN'],
                status='delivered'
            )

            # Calculate total weight
            total_kilos = delivered_packages.aggregate(
                total_weight=Sum('weight')
            )['total_weight'] or 0.00

            # Create or update delivery history
            delivery_history, created = DeliveryHistory.objects.get_or_create(
                delivery_date=timezone.now().date(),
                driver=driver,
                defaults={
                    'truck': route.truck,
                    'total_packages': delivered_packages.count(),
                    'total_kilos': total_kilos,
                    'duration_hours': duration_hours,
                    'route_assignment': route
                }
            )

            if not created:
                # Update existing record
                delivery_history.truck = route.truck
                delivery_history.total_packages = delivered_packages.count()
                delivery_history.total_kilos = total_kilos
                delivery_history.duration_hours = duration_hours
                delivery_history.route_assignment = route
                delivery_history.save()

            # Add delivered packages to the history
            delivery_history.completed_packages.set(delivered_packages)

            serializer = DeliveryHistorySerializer(delivery_history)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": f"Error creating delivery history: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GetDeliveryHistoryView(APIView):
    """
    Get delivery history for the past N days
    """
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        try:
            days = int(request.query_params.get('days', 7))
            
            # Get delivery history for the specified number of days
            history = DeliveryHistory.objects.get_recent_history(days=days)
            
            # Group by date and aggregate stats
            daily_stats = {}
            for entry in history:
                date_key = entry.delivery_date
                if date_key not in daily_stats:
                    daily_stats[date_key] = {
                        'delivery_date': date_key,
                        'delivered_packages': 0,
                        'delivered_kilos': 0.00,
                        'undelivered_packages': 0,
                        'undelivered_kilos': 0.00,
                        'total_trucks': 0,
                        'duration_hours': 0.00,
                        'drivers': set()
                    }
                
                daily_stats[date_key]['delivered_packages'] += entry.total_packages
                daily_stats[date_key]['delivered_kilos'] += float(entry.total_kilos)
                daily_stats[date_key]['undelivered_packages'] += entry.undelivered_packages
                daily_stats[date_key]['undelivered_kilos'] += float(entry.undelivered_kilos)
                daily_stats[date_key]['total_trucks'] += 1
                daily_stats[date_key]['duration_hours'] += float(entry.duration_hours)
                daily_stats[date_key]['drivers'].add(entry.driver.username)

            # Also check for any delivered/undelivered packages that might not have delivery history
            from .models import Package
            from django.db.models import Sum
            from datetime import timedelta
            
            today = timezone.now().date()
            for i in range(days):
                check_date = today - timedelta(days=i)
                
                # Get all delivered packages for this date
                delivered_packages = Package.objects.filter(
                    deliveryDate=check_date,
                    status='delivered'
                )
                
                # Get all undelivered packages for this date
                undelivered_packages = Package.objects.filter(
                    deliveryDate=check_date,
                    status='undelivered'
                )
                
                if delivered_packages.exists() or undelivered_packages.exists():
                    delivered_count = delivered_packages.count()
                    delivered_kilos = delivered_packages.aggregate(
                        total_weight=Sum('weight')
                    )['total_weight'] or 0.00
                    
                    undelivered_count = undelivered_packages.count()
                    undelivered_kilos = undelivered_packages.aggregate(
                        total_weight=Sum('weight')
                    )['total_weight'] or 0.00
                    
                    # If we don't have delivery history for this date, or if the counts don't match
                    if check_date not in daily_stats:
                        daily_stats[check_date] = {
                            'delivery_date': check_date,
                            'delivered_packages': delivered_count,
                            'delivered_kilos': float(delivered_kilos),
                            'undelivered_packages': undelivered_count,
                            'undelivered_kilos': float(undelivered_kilos),
                            'total_trucks': 1,  # Assume at least one truck
                            'duration_hours': 0.00,
                            'drivers': set()
                        }
                    else:
                        # Update with correct totals
                        daily_stats[check_date]['delivered_packages'] = delivered_count
                        daily_stats[check_date]['delivered_kilos'] = float(delivered_kilos)
                        daily_stats[check_date]['undelivered_packages'] = undelivered_count
                        daily_stats[check_date]['undelivered_kilos'] = float(undelivered_kilos)

            # Convert to list and format for frontend - single entry per day
            formatted_history = []
            for date_key, stats in sorted(daily_stats.items(), reverse=True):
                formatted_history.append({
                    'date': self._format_date(date_key),
                    'delivered': {
                        'numPackages': stats['delivered_packages'],
                        'kilos': round(stats['delivered_kilos'], 2),
                    },
                    'undelivered': {
                        'numPackages': stats['undelivered_packages'],
                        'kilos': round(stats['undelivered_kilos'], 2),
                    },
                    'numTrucks': stats['total_trucks'],
                    'hours': self._format_duration(stats['duration_hours'])
                })

            return Response(formatted_history, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Error retrieving delivery history: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _format_date(self, date_obj):
        """Format date as '20th March' style"""
        from datetime import datetime
        day = date_obj.day
        month = date_obj.strftime('%B')
        
        # Add ordinal suffix to day
        if 4 <= day <= 20 or 24 <= day <= 30:
            suffix = "th"
        else:
            suffix = ["st", "nd", "rd"][day % 10 - 1]
        
        return f"{day}{suffix} {month}"

    def _format_duration(self, total_hours):
        """Format total hours as '3:50' style"""
        hours = int(total_hours)
        minutes = int((total_hours - hours) * 60)
        return f"{hours}:{minutes:02d}"


class GetDetailedDeliveryHistoryView(APIView):
    """
    Get detailed delivery history for a specific date
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        try:
            date_str = request.query_params.get('date')
            if not date_str:
                return Response(
                    {"error": "Date parameter is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Parse date
            from datetime import datetime
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get delivery history for the specific date
            history = DeliveryHistory.objects.filter(delivery_date=target_date)
            serializer = DeliveryHistorySerializer(history, many=True)
            
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Error retrieving detailed delivery history: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CreateTodayDeliveryHistoryView(APIView):
    """
    Manually create delivery history for today's delivered packages (for testing)
    """
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsManager]

    def post(self, request):
        try:
            from .models import Package
            from django.db.models import Sum
            
            today = timezone.now().date()
            
            # Get all delivered packages for today
            delivered_packages = Package.objects.filter(
                deliveryDate=today,
                status='delivered'
            )
            
            if not delivered_packages.exists():
                return Response(
                    {"message": "No delivered packages found for today"}, 
                    status=status.HTTP_200_OK
                )
            
            total_packages = delivered_packages.count()
            total_kilos = delivered_packages.aggregate(
                total_weight=Sum('weight')
            )['total_weight'] or 0.00
            
            # Create or update delivery history
            delivery_history, created = DeliveryHistory.objects.get_or_create(
                delivery_date=today,
                defaults={
                    'total_packages': total_packages,
                    'total_kilos': total_kilos,
                    'duration_hours': 0,
                }
            )
            
            if not created:
                delivery_history.total_packages = total_packages
                delivery_history.total_kilos = total_kilos
                delivery_history.save()
            
            # Add delivered packages to the history
            delivery_history.completed_packages.set(delivered_packages)
            
            return Response({
                "message": f"Created delivery history for today: {total_packages} packages, {total_kilos} kg",
                "delivery_history": {
                    "total_packages": delivery_history.total_packages,
                    "total_kilos": float(delivery_history.total_kilos),
                    "duration_hours": float(delivery_history.duration_hours)
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"error": f"Error creating delivery history: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 